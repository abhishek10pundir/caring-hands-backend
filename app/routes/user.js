const express = require('express');
const router=express.Router();
const userController=require('../controllers/userController');
const appConfig=require('../../config/appConfig')

module.exports.setRouter=(app)=>{
    let baseUrl=`${appConfig.apiVersion}/users`;

    app.post(`${baseUrl}/signup`,userController.signUpFunction);
    app.post(`${baseUrl}/login`,userController.loginFunction);
    app.post(`${baseUrl}/getalluser`,userController.getAllUser);
    app.post(`${baseUrl}/updatepassword`,userController.updatePassword);
    app.post(`${baseUrl}/logout`,userController.logout);
    app.post(`${baseUrl}/delete`,userController.deleteAllUser);
	app.get(`${baseUrl}/getpoints/:userId`,userController.getUserPointByUserId);
}