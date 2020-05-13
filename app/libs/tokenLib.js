const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const secretKey = '789#(*90uidpu840^23sg%d1$dv*pl*i2';


//function to generate jwt token
let generateToken = (data, cb) => {
    try {
        let claims = {
            jwtid: shortid.generate(),
            iat: Date.now(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            sub: 'authToken',
            iss: 'NGO',
            data: data
        }
        let tokenDetails = {
            token: jwt.sign(claims, secretKey),
            tokenSecret: secretKey
        }
        cb(null, tokenDetails);
    } catch (err) {
        cb(err, null);
    }
}
//end of genrateToken


//function to verify token using jwt.verify()
let verifyClaim = (token, secretKey, cb) => {
    jwt.verify(token, secretKey, function (err, decoded) {
        if (err) {
            console.log('err while verifying token');
            cb(err, null);
        } else {
            cb(null, decoded);
        }
    });
}//end of verifyToken


//function to verify claim without any secretKey
let verifyClaimWithoutKey = (token, cb) => {

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.log('err while verifying token')
            console.log(err);
            cb(err, null);
        } else {
            cb(null, decoded);
        }
    })
}
//end of verifyClaimWithoutKey
module.exports = {
    generateToken: generateToken,
    verifyClaim: verifyClaim,
    verifyClaimWithoutKey: verifyClaimWithoutKey
}