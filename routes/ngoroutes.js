/**
 * Created by Yash 1300 on 14-09-2017.
 */

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Ngo = require('../models/ngo');
var Event = require('../models/events');
var config = require('../database/config');
var key = config.secretkey;

router.get('/'+key, function(req, res){
    Ngo.find({}).exec(function(err, output){
        if (err){
            console.log(err);
            res.json({Success:0, message:"Error in getting all the NGOs"});
        } else {
            console.log("Listed all the NGOs successfully");
            res.json(output);
        }
    });
});

router.post('/findngo', function(req, res){
    var name = req.body.name;
    Ngo.findNgoByName(name, function(err, ngoExists){
        if (err){
            console.log(err);
            res.json({Success: 0, message: "Error while finding the NGO"});
        } else {
            console.log("Ngo found successfully");
            res.json({Success:1, ngo:ngoExists});
        }
    });
});

router.post('/findngobyevent', function(req, res){
    var eventName = req.body.eventName;
    var event = Event.findEventByName(eventName, function(err, eventExists){
        if (err){
            console.log(err);
            res.json({Success: 0, message: "Error while finding the event"});
        } else {
            if (!eventExists){
                console.log("No event with this event name");
                res.json({Success: 0, message: "No event with this event name"});
            } else {
                Ngo.findNgoByName(eventExists.hostingngo, function(err, ngo){
                    if (err){
                        console.log(err);
                        res.json({Success: 0, message: "Error while finding the event"});
                    } else {
                        if (!ngo){
                            console.log("No event with this event name");
                            res.json({Success: 0, message: "No event with this event name"});
                        } else {
                            console.log("Ngo found successfully");
                            res.json({Success:1, ngo:ngo});
                        }
                    }
                });
            }
        }
    });
});

router.post('/delete', function(req, res){
    var email = req.body.email;
    Ngo.findNgoByEmail(email, function(err, emailexists){
        if (err){
            console.log(err);
            res.json({Success:0, message: "An error occured while removing the NGO"});
        } else {
            if (!emailexists){
                console.log("NGO doesn't exist");
                res.json({Success:0, message: "NGO doesn't exist"});
            } else {
                Ngo.deleteNgoByEmail(email, function(err){
                    if (err){
                        console.log(err);
                        res.json({Success:0, message: "An error occured while removing the NGO"});
                    } else {
                        console.log("NGO successfully deleted");
                        res.json({Success:1, message: "NGO successfully deleted"});
                    }
                });
            }
        }
    });
});

router.post('/findevents', function(req, res){
    var ngo = req.body.ngo;
    Ngo.findNgoByEmail(ngo, function(err, ngoExists){
        if (err){
            console.log(err);
            res.json({Success:0, message: "Error while finding the hosted events"});
        } else {
            if (!ngoExists){
                console.log("No NGO found with following name");
                res.json({Success:0, message: "No NGO found with the following name"});
            } else {
                Event.findEventsByNgo(ngoExists, function(err, output){
                    if (err){
                        console.log(err);
                        res.json({Success:0, message: "Error while finding the hosted events"});
                    } else {
                        console.log("Found all the hosted events");
                        var finalOutput = [];
                        for (var i=0; i<output.length; i++){
                            finalOutput.push(output[i].name);
                        }
                        res.json({Success:1, message:"Found all the hosted events", events: finalOutput});
                    }
                });
            }
        }
    });
});

router.post('/register', function(req, res){

    var newngo = new Ngo({
        name: req.body.name,
        address: req.body.address,
        locality: req.body.locality,
        phonenum: req.body.phonenum,
        email: req.body.email,
        password: req.body.password
    });

    if (newngo.name == "" || newngo.name == null || newngo.address == "" || newngo.address == null || newngo.phonenum == "" || newngo.phonenum == null || newngo.email == "" || newngo.email == null || newngo.password == "" || newngo.password == null || newngo.locality == "" || newngo.locality == null){
        console.log("Details are filled incompletely while registering the NGO");
        res.json({Success:0, message:"Please enter all the details"});
    } else {
        Ngo.findNgoByEmail(newngo.email, function(err, ngoemail){
            if (err){
                console.log(err);
                res.json({Success:0, message:"Error while registering the NGO"});
            } else {
                if (ngoemail){
                    console.log("An NGO already exists with this Email-ID");
                    res.json({Success: 0, message: "An NGO already exists with this Email-ID"});
                } else {
                    Ngo.findNgoByName(newngo.name, function(err, ngoname){
                        if (err){
                            console.log(err);
                            res.json({Success:0, message:"Error while registering the NGO"});
                        } else {
                            if (ngoname) {
                                console.log("An NGO already exists with this name");
                                res.json({Success: 0, message: "An NGO already exists with this name"});
                            } else {
                                Ngo.addNgo(newngo, function(err){
                                    if (err){
                                        console.log(err);
                                        res.json({Success:0, message:"Error while registering the NGO"});
                                    } else {
                                        console.log("NGO registered successfully");
                                        res.json({Success:1, message:"NGO registered successfully"});
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }

});

router.post('/authenticate', function(req, res){
    var email = req.body.email;
    var password = req.body.password;

    Ngo.findNgoByEmail(email, function(err, ngo){
        if (err){
            console.log(err);
            res.json({Success:0, message:"Error while logging in"});
        } else {
            if (!ngo){
                console.log("NGO doesn't exist");
                res.json({Success:0, message:"NGO doesn't exist"});
            } else {
                Ngo.comparePassword(password, ngo.password, function(err, passwordMatch){
                    if (err){
                        console.log(err);
                        res.json({Success:0, message:"Error occured while logging in"});
                    } else {
                        if (!passwordMatch){
                            console.log("Wrong password entered");
                            res.json({Success:0, message:"Wrong password entered"});
                        } else {
                            console.log("NGO successfully authenticated");
                            res.json({Success:1, message:"Successfully logged in"});
                        }
                    }
                });
            }
        }
    });
});

router.post('/delete', function(req, res){
    var email = req.body.email;
    var password = req.body.password;

    Ngo.findNgoByEmail(email, function(err, ngo){
        if (err){
            console.log(err);
            res.json({Success:0, message:"Error while removing the NGO"});
        } else {
            if (!ngo){
                console.log("NGO not found with this E-mail ID");
                res.json({Success:0, message:"NGO not found with this E-mail ID"});
            } else {
                Ngo.comparePassword(password, ngo.password, function(err, passwordMatch){
                    if (err){
                        console.log(err);
                        res.json({Success:0, message:"Error while removing the NGO"});
                    } else {
                        if (!passwordMatch){
                            console.log("Wrong password entered");
                            res.json({Success:0, message:"Wrong password entered"});
                        } else {
                            Ngo.deleteNgoByEmail(email, function(err){
                                if (err){
                                    console.log(err);
                                    res.json({Success:0, message:"Error while removing the NGO"});
                                } else {
                                    console.log("NGO successfully removed with name: "+ngo.name+" and E-mail ID: "+ngo.email);
                                    res.json({Success:1, message:"NGO successfully removed"});
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

module.exports = router;