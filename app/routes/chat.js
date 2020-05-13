const express=require('express');
const router=express.Router();
const chatController=require('../controllers/chatController');
const appConfig=require('../../config/appConfig');

module.exports.setRouter=(app)=>{
    let baseUrl=`${appConfig.apiVersion}/chat`;


    // params: senderId, receiverId, skip.
  app.get(`${baseUrl}/get/for/user`, chatController.getUsersChat);

  // params: chatIdCsv.
  app.post(`${baseUrl}/mark/as/seen`, chatController.markChatAsSeen);

  // params: userId, senderId.
  app.get(`${baseUrl}/count/unseen`, chatController.countUnSeenChat);

}