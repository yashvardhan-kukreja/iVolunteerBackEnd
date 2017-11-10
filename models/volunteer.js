/**
 * Created by Yash 1300 on 14-09-2017.
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var VolunteerSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    coins:{
        type:Number,
        default:0
    },
    address:{
        type:String,
        required:true
    },
    locality:{
        type:Number,
        required:true
    },
    phonenum:{
        type:String,
        required: true
    },
    email:{
        type:String,
        unique: true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    registeredevents:[
        {
            type:String
        }
    ]
});

var Volunteer = mongoose.model('Volunteer', VolunteerSchema, 'volunteers');

module.exports = Volunteer;

module.exports.findVolByEmail = function(emailid, callback){
    Volunteer.findOne({email: emailid}, callback);
};


module.exports.deleteVolById = function(id, callback){
    Volunteer.findOneAndRemove({_id: id}, callback);
};

module.exports.deleteVolByEmail = function(emailid, callback){
    Volunteer.findOneAndRemove({email: emailid}, callback);
};

module.exports.addVolunteer = function(vol, callback){
    bcrypt.genSalt(10, function(err, salt){
        if (err){
            console.log(err);
        } else {
            bcrypt.hash(vol.password, salt, function(err, hash){
                if (err){
                    console.log(err);
                } else {
                    vol.password = hash;
                    vol.save(callback);
                }
            });
        }
    });
};


module.exports.addEventToVol = function(event, email, callback){
    Volunteer.findOneAndUpdate({email: email}, {$addToSet:{registeredevents:event.name}}, callback);
};

module.exports.changePassword = function(volunteer, newPassword, callback){
    bcrypt.genSalt(10, function(err, salt){
        if (err){
            console.log(err);
        } else {
            bcrypt.hash(newPassword, salt, function(err, hash){
                if (err){
                    console.log(err);
                } else {
                    Volunteer.findOneAndUpdate({email: volunteer.email}, {password: hash}, callback);
                }
            });
        }
    });
};

module.exports.comparePassword = function(password, hash, callback){
    bcrypt.compare(password, hash, function(err, isMatch){
        if (err){
            console.log(err);
        } else {
            callback(null, isMatch);
        }
    });
};