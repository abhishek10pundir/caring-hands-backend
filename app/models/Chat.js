const mongoose=require('mongoose');
Schema=mongoose.Schema;
let chatSchema=new Schema({
    chatId:{type:String,unique:true,require:true},
    senderName:{type:String,default:''},
    senderId:{type:String,default:''},
    receiverName:{type:String,default:''},
    receiverId:{type:String,default:''},
    message:{type:String,default:''},
    chatRoom:{type:String,default:''},
    seen:{type:String,default:false},
    createdOn:{type:Date,default:Date.now},
    modifiedOn:{type:Date,default:Date.now}
});

mongoose.model('Chat',chatSchema);