'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  userId: {
    type: String,
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    required:true
  },
  lastName: {
    type: String,
    default: ''
  },
  gender:{
    type:String,
    require:true
  },
  password: {
    type: String,
    required:true
  },
   
  mobileNumber: {
    type: Number,
    required:true
  },
  country:{
    type:String,
    required:true
  },
  city:{
      type:String,
      required:true
  },
  isHelpSeekerUser:{
      type:Boolean,
      default:false
  },
  isHelpProviderUser:{
    type:Boolean,
    default:false  
  },
  points:{
    type:Number,
    default:0
  },
  isAdmin:{
    type:Boolean,
    default:false
  },
  panCardNumber:{
      type:String,
      default:''
  },
  
  createdOn :{
    type:Date,
    default:""
  }


})


mongoose.model('User', userSchema);