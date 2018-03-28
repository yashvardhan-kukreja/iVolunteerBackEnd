/**
 * Created by Yash 1300 on 14-09-2017.
 */
var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Volunteer = require('../models/volunteer');
var database = require('../database/config');
var nodemailer = require('nodemailer');
var Event = require('../models/events');
var Ngo = require('../models/ngo');
var key = database.secretkey;

router.post('/sendotp', function (req, res) {
    var email = req.body.email;
    var otp = req.body.otp;
    Volunteer.findVolByEmail(email, function (err, volExists) {
        if (err) {
            console.log(err);
            res.json({Success: 0, message: "An error occured while registering to event"});
        } else {
            if (!volExists) {
                console.log("Volunteer doesn't exist with this E-mail ID");
                res.json({Success: 0, message: "Volunteer doesn't exist with this E-mail ID"});
            } else {
                var smtp = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'ivolunteer.central@gmail.com',
                        pass: 'letsVolunteer'
                    }
                });
                res.json({Success: 1, message: "OTP sent to the registered email"});
                var mailOptions = {
                    to: email,
                    from: 'ivolunteer.central@gmail.com',
                    subject: 'OTP for forgot password',
                    html: '<h1>OTP for changing the password is: ' + otp + '</h1>'
                };
                smtp.sendMail(mailOptions, function (err) {
                    if (err) {
                        console.log(err);
                        res.json({Success: 0, message: "Error sending the OTP on the email"});
                    } else {
                        res.json({Success: 1, message: "OTP sent on the email successfully"});
                    }
                });

            }
        }
    });
});


router.get('/' + key, function (req, res) {
    Volunteer.find({}).exec(function (err, output) {
        if (err) {
            console.log(err);
            res.send("Error occured while getting all the volunteers");
        } else {
            console.log("Successfully got all the volunteers");
            res.json(output);
        }
    });
});

router.post('/getbasicdetails', function (req, res) {
    var email = req.body.email;
    Volunteer.findVolByEmail(email, function (err, volExists) {
        if (err) {
            console.log(err);
            res.json({Success: 0, message: "An error occured"});
        } else {
            if (!volExists) {
                console.log("No volunteer exists with this E-mail ID");
                res.json({Success: 0, message: "No volunteer exists with this E-mail ID"});
            } else {
                res.json({
                    Success: 1,
                    message: "Basic details of the volunteer displayed",
                    firstName: volExists.firstName,
                    lastName: volExists.lastName,
                    coins: volExists.coins,
                    regCount: volExists.registeredevents.length,
                    email: volExists.email,
                    contactinfo: volExists.phonenum
                });
            }
        }
    });
});

router.post('/addevent', function (req, res) {
    var email = req.body.email;
    var event = req.body.event;
    Volunteer.findVolByEmail(email, function (err, volExists) {
        if (err) {
            console.log(err);
            res.json({Success: 0, message: "An error occured while registering to event"});
        } else {
            if (!volExists) {
                console.log("Volunteer doesn't exist with this E-mail ID");
                res.json({Success: 0, message: "Volunteer doesn't exist with this E-mail ID"});
            } else {
                Event.findEventByName(event, function (err, eventExists) {
                    if (err) {
                        console.log(err);
                        res.json({Success: 0, message: "An error occured while registering to event"});
                    } else {
                        if (!eventExists) {
                            console.log("No such event exists");
                            res.json({Success: 0, message: "No such event exists"});
                        } else {
                            Volunteer.addEventToVol(eventExists, email, function (err) {
                                if (err) {
                                    console.log(err);
                                    res.json({Success: 0, message: "An error occured while registering to event"});
                                } else {
                                    Event.addVolToEvent(email, eventExists, function (err) {
                                        if (err) {
                                            console.log(err);
                                            res.json({Success: 0, message: "Error while registering to the event"});
                                        } else {
                                            if (volExists.registeredevents.indexOf(eventExists.name) < 0) {
                                                volExists.coins += eventExists.coins;
                                            }
                                            volExists.save(function (err) {
                                                if (err) {
                                                    console.log(err);
                                                    res.json({
                                                        Success: 0,
                                                        message: "An error occured while registering to event"
                                                    });
                                                } else {
                                                    console.log("Event registered to the volunteer successfully");
                                                    res.json({
                                                        Success: 1,
                                                        message: "Volunteer capacity exceeded"
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

router.post('/registeredevents', function (req, res) {
    var email = req.body.email;
    var i;
    Volunteer.findVolByEmail(email, function (err, volunteer) {
        if (err) {
            console.log(err);
            res.json({Success: 0, message: "Error occured while loading the registered events"});
        } else {
            if (!volunteer) {
                console.log("No volunteer exists with this E-mail ID");
                res.json({Success: 0, message: "No volunteer exists with this E-mail ID"});
            } else {
                var regArr = volunteer.registeredevents;
                if (regArr.length == 0) {
                    console.log("No events registered");
                    res.json({Success: 0, message: "No events registered"});
                } else {
                    var finalArr = [];
                    for (i = 0; i < regArr.length; i++) {
                        Event.findEventByName(regArr[i], function (err, eventExists) {
                            if (err) {
                                console.log(err);
                                res.json({Success: 0, message: "Error occured while loading the registered events"});
                            } else {
                                if (!eventExists) {
                                    console.log("No event registered");
                                    res.json({Success: 0, message: "No events registered"});
                                } else {
                                    Ngo.findNgoByName(eventExists.hostingngo, function (err, ngoExists) {
                                        if (err) {
                                            console.log(err);
                                            res.json({
                                                Success: 0,
                                                message: "Error occured while loading the registered events"
                                            });
                                        } else {
                                            var object = {
                                                event: eventExists,
                                                ngo: ngoExists
                                            };
                                            finalArr.push(object);
                                        }
                                    });
                                }
                            }
                        });
                    }
                    setTimeout(function () {
                        res.json({Success: 1, message: "Found the registered events", output: finalArr})
                    }, 500);
                }
            }
        }
    });
});


router.post('/register', function (req, res) {
    var volunteer = new Volunteer({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age,
        address: req.body.address,
        locality: req.body.locality,
        phonenum: req.body.phonenum,
        email: req.body.email,
        password: req.body.password
    });
    if (false) {
        res.json({Success: 0, message: "Please enter all the details"});
    } else {
        Volunteer.findVolByEmail(volunteer.email, function (err, volexists) {
            if (err) {
                console.log(err);
                res.json({Success: 0, message: "Error while registering the volunteer"});
            } else {
                if (volexists) {
                    console.log("User already exists with this emailid");
                    res.json({Success: 0, message: "User already exists with this emailid"});
                } else {
                    Volunteer.addVolunteer(volunteer, function (err) {
                        if (err) {
                            console.log(err);
                            res.json({Success: 0, message: "Error while registering the volunteer"});
                        } else {
                            console.log("Volunteer registered successfully");
                            res.json({Success: 1, message: "Volunteer registered successfully"});
                        }
                    });
                }
            }
        });
    }
});


router.post('/authenticate', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    if (email == "" || email == null || password == "" || password == null) {
        res.json({Success: 0, message: "Please enter all the details"});
    } else {
        Volunteer.findVolByEmail(email, function (err, vol) {
            if (err) {
                console.log(err);
                res.json({Success: 0, message: "Error occured while logging in"});
            } else {
                if (!vol) {
                    console.log("User doesn't exist");
                    res.json({Success: 0, message: "User not found"});
                } else {
                    Volunteer.comparePassword(password, vol.password, function (err, passwordMatch) {
                        if (err) {
                            console.log(err);
                            res.json({Success: 0, message: "Error occured while logging in"});
                        } else {
                            if (!passwordMatch) {
                                console.log("Wrong password entered");
                                res.json({Success: 0, message: "Wrong password entered"});
                            } else {
                                console.log("User successfully authenticated");
                                res.json({Success: 1, message: "Successfully logged in", locality: vol.locality});
                            }
                        }
                    });
                }
            }
        });
    }
});

router.post('/changepassword', function (req, res) {
    var email = req.body.email;
    var original = req.body.original;
    var newpass = req.body.newpass;

    Volunteer.findVolByEmail(email, function (err, vol) {
        if (err) {
            console.log(err);
            res.json({Success: 0, message: "An error occured while changing the password"});
        } else {
            if (!vol) {
                console.log("No such volunteer exists");
                res.json({Success: 0, message: "No such volunteer with the given E-mail ID exists"});
            } else {
                Volunteer.comparePassword(original, vol.password, function (err, passwordMatch) {
                    if (err) {
                        console.log(err);
                        res.json({Success: 0, message: "An error occured while changing the password"});
                    } else {
                        if (passwordMatch || original == database.secretkey) {
                            Volunteer.changePassword(vol, newpass, function (err) {
                                if (err) {
                                    console.log(err);
                                    res.json({Success: 0, message: "An error occured while changing the password"});
                                } else {
                                    console.log("Password successfully changed");
                                    res.json({Success: 1, message: "Password successfully changed"});
                                }
                            });
                        } else {
                            console.log("Original Password is wrong");
                            res.json({Success: 0, message: "Original password is wrong"});
                        }
                    }
                });
            }
        }
    });
});


router.post('/delete', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    Volunteer.findVolByEmail(email, function (err, vol) {
        if (err) {
            console.log(err);
            res.json({Success: 0, message: "Error while removing the Volunteer"});
        } else {
            if (!vol) {
                console.log("Volunteer not found with this E-mail ID");
                res.json({Success: 0, message: "Volunteer not found with this E-mail ID"});
            } else {
                Volunteer.comparePassword(password, vol.password, function (err, passwordMatch) {
                    if (err) {
                        console.log(err);
                        res.json({Success: 0, message: "Error while removing the volunteer"});
                    } else {
                        if (!passwordMatch) {
                            console.log("Wrong password entered");
                            res.json({Success: 0, message: "Wrong password entered"});
                        } else {
                            Volunteer.deleteVolByEmail(email, function (err) {
                                if (err) {
                                    console.log(err);
                                    res.json({Success: 0, message: "Error while removing the volunteer"});
                                } else {
                                    console.log("User successfully removed with name: " + vol.firstName + " and E-mail ID: " + vol.email);
                                    res.json({Success: 1, message: "Volunteer successfully removed"});
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
