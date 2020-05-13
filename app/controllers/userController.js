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
const AuthModel = mongoose.model('Auth');

 


// start user signup function 

let signUpFunction = (req, res) => {
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {

            if (check.isEmpty(req.body.password) || validateInput.Password(req.body.password) === false) {
                let apiResponse = response.generate(true, '"password" should be strong and atleast 8 characters long "', 400, null)
                reject(apiResponse);
            } else if (validateInput.mobileNumberVerify(req.body.mobileNumber) === false) {
                let apiResponse = response.generate(true, 'mobile must be 10 digit', 400, null)
                reject(apiResponse);
            }
            else {
                resolve(req);
            }

        })
    }// end validate user input

    //start of createUser
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({$or:[{ email: req.body.email },{mobileNumber:req.body.mobileNumber}]})
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10);
                        let apiResponse = response.generate(true, ':( Failed To Create User try again', 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            gender:req.body.gender,
                            
                            mobileNumber: req.body.mobileNumber,password: passwordLib.hashpassword(req.body.password),
                            country:req.body.country,
                            city:req.body.city,
                            isHelpSeekerUser:(req.body.isHelpSeekerUser=='true')?true:false,
                            isHelpProviderUser:(req.body.isHelpProviderUser=='true')?true:false,
                            isAdmin: (req.body.isAdmin=='true')?true:false,
                            panCardNumber:req.body.panCardNumber ||'',
                            
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err);
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, ':) Failed to create new User try again', 500, null)
                                reject(apiResponse);
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj);
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4);
                        let apiResponse = response.generate(true, 'User Already Present With this Email or mobileNumber', 403, null);
                        reject(apiResponse);
                    }
                })
        })
    }// end create user function


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {
    //start of finduser
    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.userName) {
                console.log("req body username is there");
				let query=(req.body.userName.indexOf("@")==-1)?{mobileNumber:req.body.userName}:{email:req.body.userName};
                console.log(req.body);
                UserModel.findOne(query, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, ':( Failed To Find User Details try again', 500, null)
                        reject(apiResponse);
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7);
                        let apiResponse = response.generate(true, 'No User with this email', 400, null);
                        reject(apiResponse);
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10);
                        resolve(userDetails);
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"userName" parameter is missing', 400, null)
                reject(apiResponse);
            }
        })
    }
    //end of finduser


    //start of validatePassword
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, ' :( Login Failed try again', 500, null);
                    reject(apiResponse);
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject();
                    delete retrievedUserDetailsObj.password;
                    delete retrievedUserDetailsObj._id;
                    delete retrievedUserDetailsObj.__v;
                    delete retrievedUserDetailsObj.createdOn;

                    resolve(retrievedUserDetailsObj);
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password ', 400, null)
                    reject(apiResponse);
                }
            })
        })
    }
    //end of validatePassword


    //start of generateToken
    let generateToken = (retrievedUserDetailsObj) => {
        console.log("generate token");
        return new Promise((resolve, reject) => {
            token.generateToken(retrievedUserDetailsObj, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, ':( Failed To Generate Token try again', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = retrievedUserDetailsObj.userId
                    tokenDetails.userDetails = retrievedUserDetailsObj
                    resolve(tokenDetails);
                }
            })
        })
    }
    //end of generateToken

    //start of saveToken function to database
    let saveToken = (tokenDetails) => {
        console.log('saveToken');
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ 'userId': tokenDetails.userId }, (err, retriveTokenDetail) => {
                if (err) {
                    logger.error(err.message, 'UserController:saveToken', 5);
                    let apiResponse = response.generate(true, ':( failed while finding token try again', 400, null);
                    reject(apiResponse);
                } else if (check.isEmpty(retriveTokenDetail)) {
                    console.log('empty');
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGeneration: time.now()
                    });
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To save Token', 500, null)
                            reject(apiResponse);
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    })
                } else {

                    retriveTokenDetail.authToken = tokenDetails.token
                    retriveTokenDetail.tokenSecret = tokenDetails.tokenSecret
                    retriveTokenDetail.tokenGenerationTime = time.now()
                    retriveTokenDetail.save((err, newTokenDetails) => {
                        if (err) {

                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To save Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }

                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }
    //end of saveToken


    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}

// end of the login function 
let updatePassword = (req, res) => {
    let findUserAndUpdate = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
			if (check.isEmpty(req.body.password) || validateInput.Password(req.body.password) === false) {
                let apiResponse = response.generate(true, '"password" should be strong and atleast 8 characters long "', 400, null)
                reject(apiResponse);
            }
            else if (req.body.mobileNumber) {
                //console.log("req body email is there");
                //console.log(req.body);
                UserModel.findOne({ mobileNumber: req.body.mobileNumber }, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, ':( Failed To Find User Details try again', 500, null)
                        reject(apiResponse);
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found with this mobileNumber', 'userController: findUser()', 7);
                        let apiResponse = response.generate(true, 'No User with this mobileNumber', 404, null);
                        reject(apiResponse);
                    } else {

                        userDetails.password=req.body.password;
                        userDetails.save((error,updatedDetails)=>{
                            if(error){
                                logger.error(err.message, 'userController: findUserAndUpdate', 10)
                                let apiResponse = response.generate(true, ':) Failed to   update password try again', 500, null)
                                reject(apiResponse);
                            }else{
                                resolve();
                            }
                        })
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"mobileNumber" parameter is missing', 400, null)
                reject(apiResponse);
            }
        })
    }
    //end of find user
    findUserAndUpdate(req, res)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password changed', 200, resolve);
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
}
//end of recover password

//get all user
let getAllUser=(req,res)=>{
    UserModel.find().exec((err,result)=>{
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }

    })
}
//end
let deleteAllUser=(req,res)=>{
    UserModel.deleteMany().exec((err,result)=>{
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }

    })
}

//get user points
let getUserPointByUserId=(req,res)=>{
    let findUserPointsDetail=()=>{
        return new Promise((resolve,reject)=>{
            if(check.isEmpty(req.params)){
                let apiResponse = response.generate(true, 'Userpoints detail not found', 404, null)
                reject(apiResponse);
            }else{
                UserModel.find({userId:req.params.userId})
                .exec((err,retrivedDetail)=>{
                    if(err){
                        logger.error(err.message, 'UserController: getUserPointByUserId', 10);
                        let apiResponse = response.generate(true, ':( Failed To get points detail please try later', 500, null);
                        reject(apiResponse);
                    }
                    else{
						
                        resolve(retrivedDetail[0].points);
                    }
                })
            }
        })
    }
findUserPointsDetail(req,res)
.then((resolve)=>{
    let apiResponse = response.generate(false,'Points retrived', 200, resolve)
    res.send(apiResponse)
}) 
}
//end

let logout = (req, res) => {
    AuthModel.findOneAndRemove({ userId: req.body.userId }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of the logout function.


module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    getAllUser:getAllUser,
    updatePassword:updatePassword,
    deleteAllUser:deleteAllUser,
	getUserPointByUserId:getUserPointByUserId,
    logout: logout

}// end exports