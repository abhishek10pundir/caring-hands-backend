const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('../libs/timeLib');
const response = require('../libs/responseLib');
const logger = require('../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const passwordLib = require('../libs/generatePasswordLib');
 

/* Models */
const UserModel = mongoose.model('User');
const ServiceModel=mongoose.model('Service')
const AppliedServiceModel=mongoose.model('appliedServiceDetail');

//function to add new serviceId by donor
let addService=(req,res)=>{
    let validateUserInput=()=>{
        return new Promise((resolve,reject)=>{
            if(check.isEmpty(req.body.serviceType)){
                let apiResponse = response.generate(true, 'Please provide type of service', 400, null)
                reject(apiResponse);
            }else if(check.isEmpty(req.body.serviceDescription)){
                let apiResponse = response.generate(true, 'Please provide description of service', 400, null)
                reject(apiResponse);
            }else{
                resolve(req);
            }
        })
    }
    let saveService=()=>{
        return new Promise((resolve,reject)=>{
            let newService=new ServiceModel({
                serviceId:shortid.generate(),
                serviceType:req.body.serviceType,
                serviceDescription:req.body.serviceDescription,
                serviceProvider:req.body.serviceProvider,
				serviceProviderName:req.body.serviceProviderName
            });
            newService.save((err,success)=>{
                if (err) {
                    console.log(err);
                    logger.error(err.message, 'serviceController: addserivce', 10)
                    let apiResponse = response.generate(true, ':) Failed to create new service try again', 500, null)
                    reject(apiResponse);
                } else {
                    let newServiceObj = newService.toObject();
                    resolve(newServiceObj);
                }
            })
        })
    }

    validateUserInput(req,res)
    .then(saveService)
    .then((resolve)=>{
        delete resolve.serviceProvider
        let apiResponse = response.generate(false, 'Service created', 200, resolve)
        res.send(apiResponse)
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    })
}
//end
//function to get service detail by providing serviceId
let getServiceDetail=(req,res)=>{
    let findServiceDetail=()=>{
        return new Promise((resolve,reject)=>{
            if(check.isEmpty(req.params)){
                let apiResponse = response.generate(true, 'Service Details not find', 404, null)
                reject(apiResponse);
            }else{
                ServiceModel.findOne({serviceId:req.body.serviceId})
                .exec((err,retrivedService)=>{
                    if(err){
                        logger.error(err.message, 'ServiceController: getServiceDetail', 10);
                        let apiResponse = response.generate(true, ':( Failed To get servicedetail please try later', 500, null);
                        reject(apiResponse);
                    }
                    else{
                        resolve(retrivedService);
                    }
                })
            }
        })
    }
findServiceDetail(req,res)
.then((resolve)=>{
    let apiResponse = response.generate(false,'Service retrieved', 200, resolve)
    res.send(apiResponse)
})

}
//end


//function to get all services for donor user that are not assigned
let getAllNonAssignedSerivcesByUserId=(req,res)=>{
    let findAllServiceDetail=()=>{
        return new Promise((resolve,reject)=>{
            if(check.isEmpty(req.params)){
                let apiResponse = response.generate(true, 'Service Details not find', 404, null)
                reject(apiResponse);
            }else{
                ServiceModel.find({$and:[{serviceProvider:req.params.userId},{serviceAssigned:false}]})
                .exec((err,retrivedService)=>{
                    if(err){
                        logger.error(err.message, 'ServiceController: getAllSerivcesByUserId', 10);
                        let apiResponse = response.generate(true, ':( Failed To get servicedetail please try later', 500, null);
                        reject(apiResponse);
                    }
                    else{
                        resolve(retrivedService);
                    }
                })
            }
        })
    }
findAllServiceDetail(req,res)
.then((resolve)=>{
    let apiResponse = response.generate(false,'Services retrieved', 200, resolve)
    res.send(apiResponse)
}) 
}
//end 

//function to get all service for donor user that are assigned
let getAllAssignedServiceByUserdId=(req,res)=>{
    let findAllServiceDetail=()=>{
        return new Promise((resolve,reject)=>{
            if(check.isEmpty(req.params)){
                let apiResponse = response.generate(true, 'Service Details not find', 404, null)
                reject(apiResponse);
            }else{
                ServiceModel.find({$or:[{$and:[{serviceProvider:req.params.userId},{serviceAssigned:true}]},
				{$and:[{serviceConsumer:req.params.userId},{serviceAssigned:true}]}]})
                .exec((err,retrivedService)=>{
                    if(err){
                        logger.error(err.message, 'ServiceController: findAllServiceDetail', 10);
                        let apiResponse = response.generate(true, ':( Failed To get servicedetail please try later', 500, null);
                        reject(apiResponse);
                    }
                    else{
                        resolve(retrivedService);
                    }
                })
            }
        })
    }
findAllServiceDetail(req,res)
.then((resolve)=>{
    let apiResponse = response.generate(false,'Services retrieved', 200, resolve)
    res.send(apiResponse)
}) 
}
//end
let getAllService=(req,res)=>{
    let findAllServiceDetail=()=>{
        return new Promise((resolve,reject)=>{
            if(check.isEmpty(req.params)){
                let apiResponse = response.generate(true, 'Service Details not find', 404, null)
                reject(apiResponse);
            }else{
                ServiceModel.find({serviceAssigned:false})
                .exec((err,retrivedService)=>{
                    if(err){
                        logger.error(err.message, 'ServiceController: getAllService', 10);
                        let apiResponse = response.generate(true, ':( Failed To get servicedetail please try later', 500, null);
                        reject(apiResponse);
                    }
                    else{
                        resolve(retrivedService);
                    }
                })
            }
        })
    }
findAllServiceDetail(req,res)
.then((resolve)=>{
    let apiResponse = response.generate(false,'Services retrieved', 200, resolve)
    res.send(apiResponse)
})
}

let deleteAllService=(req,res)=>{
    ServiceModel.deleteMany().exec((err,result)=>{
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }

    })
}

//function to add user to applyservicelist who had  applied for that service 
let addUserToAppliedServiceList=(req,res)=>{
    let validateUserInput=()=>{
        return new Promise((resolve,reject)=>{
            if(check.isEmpty(req.body.userComment)){
                let apiResponse = response.generate(true, 'Please write your reason to apply for service ', 400, null)
                reject(apiResponse);
            }else  if(check.isEmpty(req.body.userName)){
                let apiResponse = response.generate(true, 'userName not found ', 400, null)
                reject(apiResponse);
            }
            else  if(check.isEmpty(req.body.userGender)){
                let apiResponse = response.generate(true, 'userGender not found ', 400, null)
                reject(apiResponse);
            }else  if(check.isEmpty(req.body.serviceId)){
                let apiResponse = response.generate(true, 'serviceId not found ', 400, null)
                reject(apiResponse);
            }else  if(check.isEmpty(req.body.userId)){
                let apiResponse = response.generate(true, 'userId not found ', 400, null)
                reject(apiResponse);
            }else{
                resolve(req);
            }
        })
    }
    let saveUserToServiceList=()=>{
        return new Promise((resolve,reject)=>{
            AppliedServiceModel.findOne({$and:[{userId:req.body.userId},{serviceId:req.body.serviceId}]}).exec((err,result)=>{
                if(err){
                    logger.error(err.message, 'serviceController: saveUserToServiceList', 10);
                    let apiResponse = response.generate(true, ':( Failed To add User try again', 500, null);
                    reject(apiResponse);
                }else if(check.isEmpty(result)){
                    let newAppliedUser=new AppliedServiceModel({
                        serviceId:req.body.serviceId,
                        userId:req.body.userId,
                        userComment:req.body.userComment,
						userName:req.body.userName,
						userGender:req.body.userGender
                    });
                    newAppliedUser.save((err,success)=>{
                        if (err) {
                            console.log(err);
                            logger.error(err.message, 'serviceController: addUserToAppliedServiceList', 10)
                            let apiResponse = response.generate(true, ':) Failed to create add user to servicelist try again', 500, null)
                            reject(apiResponse);
                        } else {
                            let newServiceObj = newAppliedUser.toObject();
                            resolve(newServiceObj);
                        }
                    })
                }else{
                    logger.error('User Cannot Be added.User Already applied', 'serviceController: saveUserToServiceList', 4);
                    let apiResponse = response.generate(true, 'You had already applied for this service', 403, null);
                    reject(apiResponse);
                }
            })
          
        })
    }

    validateUserInput(req,res)
    .then(saveUserToServiceList)
    .then((resolve)=>{
        
        let apiResponse = response.generate(false, 'user added to service', 200, resolve)
        res.send(apiResponse);
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    })
}
//end

//get all user who applied for particular service
let getAllUsersAppliedForService=(req,res)=>{
    //fetch all user applied for service
    let fetchUsers=()=>{
        console.log(req.body.serviceId);
        return new Promise((resolve,reject)=>{
            AppliedServiceModel.find({serviceId:req.body.serviceId}).exec((err,retriveDetail)=>{
                if(err){
                    logger.error(err.message, 'ServiceController: getAllUsersAppliedForService', 10);
                    let apiResponse = response.generate(true, ':( Failed To fetch users applied for service please try later', 500, null);
                    reject(apiResponse);
                }else{
                    resolve(retriveDetail)
                }
            })
        })
    }
    
    fetchUsers(req,res)
    .then((resolve)=>{
        let apiResponse = response.generate(false, 'details fetch', 200, resolve)
        res.send(apiResponse);
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    })
}
//

//function to add approved user into approveuserschema and delete all users from appliedservice for particular serviceId
let approvedUser=(req,res)=>{
    //validate input  
    let validateInput=()=>{
        return new Promise((resolve,reject)=>{
            if(!req.body.providerId){
                let apiResponse = response.generate(true, 'ProviderId missing', 400, null)
                reject(apiResponse);
            }else if(!req.body.userId){
                let apiResponse = response.generate(true, 'Approved user userId missing', 400, null)
                reject(apiResponse);
            }else if(!req.body.serviceId){
                let apiResponse = response.generate(true, 'ServiceId missing', 400, null)
                reject(apiResponse);
            }else {
                resolve(req);
                
            }
        })
    }
//update service field --serviceassigned =true and serviceConsumer=consumeruserid 
let updateServiceModel=()=>{ 
    return new Promise((resolve,reject)=>{
        ServiceModel.findOne({$and:[{serviceId:req.body.serviceId},{serviceProvider:req.body.providerId}]})
        .exec((err,result)=>{
            if(err){
                logger.error(err.message, 'serviceController: approvedUser', 10);
                let apiResponse = response.generate(true, ':( Failed To find service try again', 500, null);
                reject(apiResponse);
            }else{
                result.serviceAssigned=true;
                result.serviceConsumer=req.body.userId;
                result.serviceConsumerName=req.body.userName;
                result.save((err,result)=>{
                    if (err) {
                        //console.log(err);
                        logger.error(err.message, 'serviceController: approvedUser', 10)
                        let apiResponse = response.generate(true, ':) Failed to save update service try again', 500, null)
                        reject(apiResponse);
                    } else {
                         resolve(req);
                    }
                })
            }
        })
    })
    
}//end

//delete  service detail from appliedservicedetail
    let deleteServceDetail=()=>{
        return new Promise((resolve,reject)=>{
            AppliedServiceModel.deleteMany({serviceId:req.body.serviceId}).exec((err,success)=>{
                if(err){
                    logger.error(err.message, 'ServiceController: deleteServceDetail', 10);
                    let apiResponse = response.generate(true, ':( Failed To delete service from appliedservicedetail applied for service please try later', 500, null);
                    reject(apiResponse);
                }else{
                    resolve(success)
                }

        })
    })
}//end 

validateInput(req,res)
.then(updateServiceModel)
.then(deleteServceDetail)
.then((resolve)=>{
    let apiResponse = response.generate(false, 'User approved', 200, resolve)
    res.send(apiResponse)
})
.catch((err) => {
    console.log(err);
    res.send(err);
})
}


//delete service by serviceId when user get the service
let deleteServiceById=(req,res)=>{
   ServiceModel.deleteOne({serviceId:req.body.serviceId}).exec((err,success)=>{
    if(err){
        logger.error(err.message, 'ServiceController: deleteServiceById', 10);
        let apiResponse = response.generate(true, ':( Failed To delete service from appliedservicedetail applied for service please try later', 500, null);
        res.send(apiResponse);
    }else{
        let apiResponse=response.generate(false,"deleted successfully",200,{})
        resolve(apiResponse);
    }
   })
}
//


//end
module.exports={
    addService:addService,
    getServiceDetail:getServiceDetail,
    getAllNonAssignedSerivcesByUserId:getAllNonAssignedSerivcesByUserId,
    getAllAssignedServiceByUserdId:getAllAssignedServiceByUserdId,
    getAllService:getAllService,
    deleteAllService:deleteAllService,
    addUserToAppliedServiceList:addUserToAppliedServiceList,
    getAllUsersAppliedForService:getAllUsersAppliedForService,
    approvedUser:approvedUser,
    deleteServiceById:deleteServiceById
}