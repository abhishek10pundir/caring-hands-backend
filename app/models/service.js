'use strict'
/**
 * Module Dependencies
 */
const mongoose=require('mongoose'),
Schema=mongoose.Schema;

let serviceSchema=new Schema({
    serviceId:{
        type:String,
        index:true,
        unique:true
    },
    serviceType:{
        type:String,
        require:true
    },
    serviceDescription:{
        type:String,
        require:true,
    },
    serviceAssigned:{
        type:Boolean,
        default:false
    },
    serviceConsumer:{
        type:String,
        ref:'userSchema'
    },
    serviceConsumerName:{
        type:String,
        default:''
    },
	serviceProviderName:{
		type:String,
		default:''
	},
    serviceProvider:{
        type:String,
        require:true
    }
    

})

mongoose.model('Service',serviceSchema);