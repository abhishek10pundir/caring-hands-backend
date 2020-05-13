const check=require('./checkLib');
const redis=require('redis');
let client=redis.createClient();

client.on('connect',()=>{
    console.log('redis con successfull');
})
//get all onlineuserlist from redis
let getAllUsersInHash=(hashName,callback)=>{
    client.hgetall(hashName,(err,result)=>{
        if(err){
            console.log('err in getAllUsersInHash-',err)
            callback(err,null);
        }else if(check.isEmpty(result)){
            console.log('online userList is empty');
            callback(null,{});
        }else{
            callback(null,result);
        }
    })
}
//end


//set new user to online hashlist
let setNewOnlineUser=(hashName,key,val,callback)=>{
client.hmset(hashName,[key,val],(err,result)=>{
    if(err){
        console.log('err in setNewOnlineUserInHash-',err);
            callback(err,null);
        }else{
            console.log('user has been set in hash');
            console.log(result);
            callback(null,result);
    }
})
}

//end

//delete user from hashList
let deleteUserFromHash=(hashName,key)=>{
    client.hdel(hashName,key);
    return true;
}
//end

module.exports={
    getAllUsersInHash:getAllUsersInHash,
    setNewOnlineUser:setNewOnlineUser,
    deleteUserFromHash:deleteUserFromHash
}