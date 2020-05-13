const express=require('express');
const router=express.Router();
const serviceController=require('../controllers/serviceController');
const appConfig=require('../../config/appConfig');

module.exports.setRouter=(app)=>{
    let baseUrl=`${appConfig.apiVersion}/service`;

    app.post(`${baseUrl}/addservice`,serviceController.addService);
    app.post(`${baseUrl}/getservice`,serviceController.getServiceDetail);
    app.get(`${baseUrl}/getnonassigned/:userId`,serviceController.getAllNonAssignedSerivcesByUserId);
    app.get(`${baseUrl}/getassigned/:userId`,serviceController.getAllAssignedServiceByUserdId);
    app.get(`${baseUrl}/getallservice`,serviceController.getAllService);
    app.post(`${baseUrl}/deleteservice`,serviceController.deleteAllService);
    app.post(`${baseUrl}/addusertoservicelist`,serviceController.addUserToAppliedServiceList);
    app.post(`${baseUrl}/getapplieduser`,serviceController.getAllUsersAppliedForService);
    app.post(`${baseUrl}/userapproved`,serviceController.approvedUser);
    app.post(`${baseUrl}/deleteservice`,serviceController.deleteServiceById);
}