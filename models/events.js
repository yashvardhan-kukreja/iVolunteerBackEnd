/**
 * Created by Yash 1300 on 17-09-2017.
 */

var mongoose = require('mongoose');
var express = require('express');
var bcrypt = require('bcrypt');

var EventSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        unique: true
    },
    maximumCapacity: {
        type: Number,
        default: 5
    },
    hostingngo:{
        type:String,
        required: true
    },
    description:{
        type:String,
        default: "No description available"
    },
    coins:{
        type:Number,
        required: true
    },
    registeredvol:[
        {
            type:String
        }
    ],
    startdate:{
        type: Date,
        required: true
    },
    enddate:{
        type: Date,
        required: true
    },
    hostlocality:{
        type: Number,
        required: true
    }
});

var Event = mongoose.model('Event', EventSchema, 'events');
module.exports = Event;

module.exports.findEventByName = function(eventname, callback){
    Event.findOne({name: eventname}, callback);
};

module.exports.findEventById = function(id, callback){
    Event.findOne({_id: id}, callback);
};

/*module.exports.findEventByNgo = function(ngoname, callback){
    Event.findOne({hostingngo: ngoname}, callback);
};*/

module.exports.deleteEventByName = function(eventname, callback){
    Event.findOneAndRemove({name: eventname}, callback);
};

module.exports.addEvent = function(event, callback){
    event.save(callback);
};

module.exports.addVolToEvent = function(email, event, callback){
    Event.findOneAndUpdate({name: event.name}, {$addToSet:{registeredvol: email}}, callback);
};

module.exports.findEventsByNgo = function(ngo, callback){
    Event.find({hostingngo: ngo.name}, callback);
};



module.exports.findEventByLocality = function(locality, callback){
    Event.find({hostlocality: locality}, callback);
};
