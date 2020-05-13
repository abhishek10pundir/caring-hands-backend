'use strict'
/**
 * Module Dependencies
 */
const mongoose=require('mongoose'),
Schema=mongoose.Schema;
const appliedServiceDetail=new Schema({
    serviceId:{
        type:String,
        ref:'serviceSchema'
    },
    userId:{
        type:String,
        ref:'userSchema'
    },
    userName:{
        type:String,
        required:true
    },
    userGender:{
        type:String,
        required:true
    },
    userComment:{
        type:String,
        required:true
    }
    
})

mongoose.model('appliedServiceDetail',appliedServiceDetail);