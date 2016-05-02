var async = require('async');
var validator = require("email-validator");
var bcrypt = require('bcrypt');
var sendResponse = require('./sendResponse.js');
var constant = require('./constant.js');
var connection = require('./db.js');
var nodemailer = require('nodemailer');
const saltRounds = 10;
var profile = require('./profile.js');


exports.signUp = function(req, res) {
    var email = req.body.email;
    var device_id = req.body.deviceId;
    var password = req.body.password;
    var name = req.body.name;
    console.log('body', req.body);
    var hash = 0;

    async.auto({
        validEmail: function(callback) {
            var checkEmail = validator.validate(email);
            console.log('valid email')
            if (checkEmail)
                callback(null);
            else {
                var msg = "enter valid email";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);
            }

        },
        checkDevice: function(callback) {
            q = 'select * from user where device_id = ? ';
            console.log('check device')
            connection.query(q, [device_id], function(err, result) {
                if (err)
                    callback(err);

                else if (result.length != 0) {
                    var msg = "device id already registered";
                    sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);

                } else
                    callback(null);
            });
        },
        checkEmail: function(callback) {
            console.log('check email')
            q = 'select * from user where email = ? ';
            connection.query(q, [email], function(err, result) {
                if (err)
                    callback(err);

                else if (result.length != 0) {
                    var msg = "email id already registered";
                    sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);

                } else
                    callback(null);
            });

        },
        checkName: function(callback) {
            console.log('check name')
            q = 'select * from user where name = ? ';
            connection.query(q, [device_id], function(err, result) {
                if (err)
                    callback(err);

                else if (result.length != 0) {
                    var msg = " name already registered";
                    sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);

                } else
                    callback(null);
            });
        },
        checkPassword: function(callback) {
            console.log('check pass')
            var salt = bcrypt.genSaltSync(saltRounds);
            hash = bcrypt.hashSync(password, salt);
            callback(null);


        },
        storeData: ['validEmail', 'checkDevice', 'checkEmail', 'checkName', 'checkPassword',
            function(callback) {
                console.log('store data');
                q = ' insert into user(email,device_id,password,name) value(?,?,?,?) ';
                connection.query(q, [email, device_id, hash, name], function(err, result) {
                    if (err)
                        callback(err);
                    else
                        callback(null, result);
                })
            }
        ],
        sendEmail: ['storeData',
            function(callback) {
                // console.log(config.get('EmailCredentials.email'));

                var transporter = nodemailer.createTransport("SMTP", {
                        service: "Gmail",
                        auth: {
                            user: 'thoughtfire9@gmail.com',
                            pass: 'pass####'
                        }
                    })
                    // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: 'thoughtfire9@gmail.com', // sender address
                    to: email, // list of receivers
                    subject: constant.responseMessage.SUPPLIER_REG, // Subject line
                    // text:'your password is '+inputArray[1] , // plaintext body
                    html: '<h1> Welcome to code brew </h1>:' + email // html body
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        return console.log(error);
                    } else {
                        console.log('Message sent: ' + JSON.stringify(info));
                        callback(null);
                    }

                });
            }
        ]


    }, function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    })
}

exports.signIn = function(req, res) {
    var email = req.body.email;
    var pass = req.body.password;
    var pass1 = 0;
    var userId =0;

    async.auto({
        checkEmail: function(callback) {
            q = ' select * from user where email = ? limit 1 ';
            console.log('q=========', q);
            connection.query(q, [email], function(err, result) {
                if (result.length != 0) {
                    pass1 = result[0].password;
                    userId = result[0].id;

                    callback(null);
                } else {
                    callback(err);
                }
            });
        },
        checkPass: ['checkEmail',
            function(callback) {
                console.log('pass==========', pass1)
                console.log('password----------', pass);
                var bool = bcrypt.compareSync(pass, pass1); // 
                console.log('bool-----',bool);
                if (bool == true)
                    {
                    	profile.getData(userId , res);
                    }
                else
                    { var msg = "wrong password";
                sendResponse.sendErrorMessage(msg, res, constant.responseMessage.NO_DATA_FOUND);}
            }
        ]

    }, function(err, result) {
        if (err) {
            sendResponse.somethingWentWrongError(res);
        } else {

            sendResponse.sendSuccessData(result, constant.responseMessage.SUCCESS, res, constant.responseStatus.SUCCESS);
        }
    });
}