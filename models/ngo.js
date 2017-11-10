/**
 * Created by Yash 1300 on 14-09-2017.
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var NGOSchema = new mongoose.Schema({
    name:{
        type:String,
        unique: true,
        required:true
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
    }
});

var Ngo = mongoose.model('Ngo', NGOSchema, 'ngos');
module.exports = Ngo;

module.exports.findNgoByEmail = function(emailid, callback){
    Ngo.findOne({email: emailid}, callback);
};

module.exports.findNgoByName = function(name, callback){
    Ngo.findOne({name: name}, callback);
};

module.exports.deleteNgoByEmail = function(emailid, callback){
    Ngo.findOneAndRemove({email: emailid}, callback);
};

module.exports.addNgo = function(ngo, callback){
    bcrypt.genSalt(10, function(err, salt){
        if (err){
            console.log(err);
        } else {
            bcrypt.hash(ngo.password, salt, function(err, hash){
                if (err){
                    console.log(err);
                } else {
                    ngo.password = hash;
                    ngo.save(callback);
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