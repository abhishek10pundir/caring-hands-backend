const mongoose=require('mongoose');
const shortid=require('shortid');
const logger=require('./loggerLib');
const socketio=require('socket.io');
const tokenLib=require('./tokenLib');
const check=require('./checkLib');
const response=require('./responseLib');
const events=require('events');
const redisLib=require('./redisLib');
const eventEmitter=new events.EventEmitter();
const ChatModel=mongoose.model('Chat');
const UserModel = mongoose.model('User');
const ServiceModel=mongoose.model('Service')
let setServer=(server)=>{
    let io=socketio.listen(server)//conection to server
    let myio=io.of('/');//initialize socket
    myio.on('connection',(socket)=>{//main eventHandler
        console.log('on connection--emit verify user');
        socket.emit('verifyUser',"");

        socket.on('set-user',(authToken)=>{
            tokenLib.verifyClaimWithoutKey(authToken,(err,user)=>{
                if(err){
                    socket.emit('auth-error',{status:500,error:'authToken is missing'})
                }else{
                    console.log('user verifed by authtoken');
                    let currentUser=user.data;
                    //updating socket id to userid
                    socket.userId=currentUser.userId;
                    let fullName=currentUser.firstName+ ' '+ currentUser.lastName;
                    let key=currentUser.userId;
                    let value=fullName;
                    let setUserOnline=redisLib.setNewOnlineUser('onlineUsers',key,value,(err,result)=>{
                        if(err){
                            console.log('err setUserOnline',err);
                        }else{
                            redisLib.getAllUsersInHash('onlineUsers',(error,users)=>{
                                if(error){
                                    console.log('err getonline user list',error)
                                }else{
                                    console.log(fullName+' is online');
                                    //setting rooms name
                                    //socket.room = 'ngoChat';
                                    // joining chat-group room.
                                    let join=socket.join('ngoChat',(err)=>{
                                        if(err){
                                            console.log('error occured');
                                            console.log(err);
                                        }
                                        socket.room='ngoChat';
                                        socket.broadcast.to(socket.room).emit('online-user-list',users);
                                    })   
                                }
                            })//end of getalluser
                        }
                    })//end of setUserOnline


                }
            })
        })
        //if socket disconnect
        socket.on('disconnect',()=>{
            if(socket.userId){
                redisLib.deleteUserFromHash('onlineUsers',socket.userId);
                redisLib.getAllUsersInHash('onlineUsers',(err,userhash)=>{
                    if(err){
                        console.log('err disconnect',err);
                    }else{
                        console.log('user disconnet');
                        socket.leave(socket.room)
                        socket.broadcast.emit('online-user-list',userhash);
                        
                    }
                })
            }
        })
        //end
        
        //chat msg 
        socket.on('chat-msg',(data)=>{
            //console.log('chat msg called');
            data['chatId']=shortid.generate();
            setTimeout(function(){
                eventEmitter.emit('save-chat',data);
            },2000);
            myio.emit(data.receiverId,data);
        })
        //end
		 
		 //userapplied for service 
		 socket.on('userappliedemit',(data)=>{
			 //console.log('userappliedemit',data)
			 myio.emit('userapplied',data);
		 })
		 //end
		 
		 //service approved
        socket.on('serviceApproved',(userId)=>{
			let val=userId+'aprroved';
            //console.log('service approved call');
            myio.emit(val,{});
        })
        //end
		
		//delete service from dashboard
		socket.on('delete-service-dashboard',(serviceId)=>{
			myio.emit('deleted-service-dashboard',serviceId)
		});
		//end

        //add one point to provider when service delivered 
        socket.on('confirm',(data)=>{
            let val=data.serviceProvider+'addpoint';
            setTimeout(() => {
                eventEmitter.emit('addpoint',data.serviceProvider);
				eventEmitter.emit('deleteService',data.serviceId);
            }, 2000);
            myio.emit(val,{});
        })
        //end
       
    })
}

// database operations are kept outside of socket.io code.

// saving chats to database.
 
eventEmitter.on('save-chat',(data)=>{
    let newChat=new ChatModel({
        chatId:data.chatId,
        senderName:data.senderName,
        senderId:data.senderId,
        receiverId:data.receiverId,
        receiverName:data.receiverName,
        message:data.message,
        chatRoom:data.chatRoom || '',
        createdOn:data.createdOn
    });
    newChat.save((err,result)=>{
        if(err){
            console.log(`error occurred: ${err}`);
        }
        else if(result == undefined || result == null || result == ""){
            console.log("Chat Is Not Saved.");
        }
        else {
            console.log("Chat Saved.");
            console.log(result);
        }
    })
});//end of save chat

//update user point by one
eventEmitter.on('addpoint',(userId)=>{
    UserModel.findOne({userId:userId}).exec((error,result)=>{
        if(error){
            console.log('some error occurred',error);
        }else{
            result.points+=10;
            result.save((err,success)=>{
                if(err){
                    console.log('some error occurred',err);
                }else{
                    console.log('points saved');
                }
            })
        }
    })
})
//
//delete service 
eventEmitter.on('deleteService',(serviceId)=>{
    ServiceModel.deleteOne({serviceId:serviceId}).exec((err,success)=>{
    if(err){
         console.log('some error occurred',error);
    }else{
        console.log('service deleted');
    }
   })
})
//
  

module.exports={
    setServer:setServer
}