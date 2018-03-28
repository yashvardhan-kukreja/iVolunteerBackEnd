/**
 * Created by Yash 1300 on 18-09-2017.
 */
var mongoose = require('mongoose');
var express = require('express');
var Event = require('../models/events');
var Ngo = require('../models/ngo');
var Volunteer= require('../models/volunteer');
var router = express.Router();

/*router.post('/findbyid', function(req, res){
    var id = req.body.id;
    Event.findEventById(id, function(err, event){
        if (err){
            console.log(err);
            res.send("Errrorrr");
        } else {
            if (!event){
                console.log("No event");
                res.send("No event");
            } else {
                console.log("yayyee.. Success");
                res.send(event.name);
            }
        }
    });
});*/
router.post('/findeventsavailable', function(req, res){
    Event.findEventByLocality(req.body.locality, function(err, allEvents){
        if (err){
            console.log(err);
            res.json({Success:0, message: "An error occured while finding all the events"});
        } else {
            console.log("Found all the events successfully");
            res.json({Success: 1, events: allEvents});
        }
    });
});

router.post('/findeventbyeventname', function(req, res){
    var eventName = req.body.eventName;
    Event.findEventByName(eventName, function(err, eventExists){
        if (err){
            console.log(err);
            res.json({Success:0, message: "An error occured"});
        } else {
            if (!eventExists){
                console.log("No event found");
                res.json({Success:0, message: "No event exists found", event: eventExists});
            } else {
                var ngo = eventExists.hostingngo;
                Ngo.findNgoByName(ngo, function(err, ngoExists){
                    if (err){
                        console.log(err);
                        res.json({Success:0, message: "Error occured"});
                    } else {
                        if (!ngoExists){
                            console.log("No NGO is associated with this event");
                            res.json({Success:0, message: "No NGO associated with this event"});
                        } else {
                            res.json({Success:1, event: eventExists, ngo: ngoExists});
                        }
                    }
                });
            }
        }
    });
});

router.post('/addvol', function(req, res){
    var eventname = req.body.eventname;
    var volemail = req.body.volemail;

    Event.findEventByName(eventname, function(err, event){
        if (err){
            console.log(err);
            res.json({Success:0, message:"An error occured"});
        } else {
            if (!event){
                console.log("Event doesn't exist");
                res.json({Success:0, message:"Event doesn't exist"});
            } else {
                if (event.maximumCapacity <= event.registeredvol.length) {
                    res.json({success: 0, message: "Volunteer capacity exceeded"});
                } else {
                    Volunteer.findVolByEmail(volemail, function(err, vol){
                        if (err){
                            console.log(err);
                            res.json({Success:0, message:"An error occured"});
                        } else {
                            if (!vol){
                                console.log("Volunteer doesn't exist");
                                res.json({Success:0, message:"Volunteer doesn't exist"});
                            } else {
                                Event.addVolToEvent(vol.email, event, function(err){
                                    if (err){
                                        console.log(err);
                                        res.json({Success:0, message:"An error occured"});
                                    } else {
                                        console.log("Volunteer added to the event");
                                        res.json({Success:1, message:"Volunteer capacity exceeded"});
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
    });
});

router.post('/register', function(req, res){
    var emailOfNgo = req.body.hostingngo;
    var hostingngoname;
    Ngo.findNgoByEmail(emailOfNgo, function(err, ngoExists){
        if (err){
            console.log(err);
            res.json({Success:0, message: "An error occured while registering the event"});
        } else {
            hostingngoname = ngoExists.name;
        }
    });
    setTimeout(function(){
        var newEvent = new Event({
            name: req.body.name,
            hostingngo: hostingngoname,
            description: req.body.description,
            coins: req.body.coins,
            startdate: req.body.startdate,
            enddate: req.body.enddate,
            hostlocality: req.body.hostlocality
        });

        Event.findEventByName(newEvent.name, function(err, eventExists){
            if (err){
                console.log(err);
                res.json({Success:0, message: "An error occured while registering the event"});
            } else {
                if (eventExists){
                    console.log("An event already exists with the following details");
                    res.json({Success:0, message: "An event already exists with the following details"});
                } else {
                    Event.addEvent(newEvent, function(err){
                        if (err){
                            console.log(err);
                            res.json({Success:0, message: "An error occured while registering the event"});
                        } else {
                            console.log("Event successfully registered");
                            res.json({Success:1, message: "Event successfully registered"});
                        }
                    });
                }
            }
        });
    }, 500);
});

router.post('/delete', function(req, res){
    Event.findEventByName(req.body.name, function(err, eventExists){
        if (err){
            console.log(err);
            res.json({Success:0, message: "An error occured while removing the event"});
        } else {
            if (!eventExists){
                console.log("No event exists with the following details");
                res.json({Success:0, message: "No event exists with the following details"});
            } else {
                Event.deleteEventByName(req.body.name, function(err){
                    if (err){
                        console.log(err);
                        res.json({Success:0, message: "An error occured while removing the event"});
                    } else {
                        console.log("Event successfully removed");
                        res.json({Success:1, message: "Event successfully removed"});
                    }
                });
            }
        }
    });
});

router.post('/findvolsbyevent', function(req, res){
    var event = req.body.event;
    Event.findEventByName(event, function(err, eventExists){
        if (err){
            console.log(err);
            res.json({Success:0, message:"An error occured"});
        } else {
            if (!eventExists){
                console.log("No event exists with this name");
                res.json({Success:0, message:"No event exists with this name"});
            } else {
                res.json({Success:1, message:"Registered volunteers found for the event "+eventExists.name, volunteers:eventExists.registeredvol});
            }
        }
    });
});

module.exports = router;