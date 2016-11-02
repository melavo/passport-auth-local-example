var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));
	
		/* GET forget password Page */
	router.get('/forget', function(req, res){
		res.render('forget',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/forget', function(req, res){
		var User = require('../models/user');
		var bCrypt = require('bcrypt-nodejs');
		var nodemailer = require("nodemailer");
		var smtpTransport = require("nodemailer-smtp-transport")
		var smtpTransport = nodemailer.createTransport(smtpTransport({
		    host : "smtp.gmail.com",
		    secureConnection : false,
		    port: 587,
		    auth : {
		            user: "<account_smtp>",
		            pass: "<password_smtp>"
		    }
		}));
		 // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }
    var randomString = function(length) {
					  var str = '';
					  var chars ='0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split(
					      '');
					  var charsLen = chars.length;
					  if (!length) {
					    length = ~~(Math.random() * charsLen);
					  }
					  for (var i = 0; i < length; i++) {
					    str += chars[~~(Math.random() * charsLen)];
					  }
					  return str;
					};
		if( req.param('username').length > 0){
                 User.findOne({ 'username' :   req.param('username') }, 
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        {
                        	req.flash('message',err);
							res.redirect('/forget');
                        }
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username '+req.param('username')); 
                        req.flash('message', 'User Not found.');
						res.redirect('/forget');
                    }
                     var query = {'username':user.username};
					
    				var password=randomString(8);
					user.password = createHash(password);
					User.findOneAndUpdate(query, user, {upsert:true}, function(err, doc){
						if (err)
						req.flash('message',err);
						else
						req.flash('message','');
						//	res.redirect('/forget');
							
					    // if (err) return res.send(500, { error: err });
					    // return res.send("succesfully saved");
					    
					});
                    var mailOptions={
                            from : "waynevo <info@3tiermarketing.com>",
                            to : "info@3tiermarketing.com",
                            subject : 'forget password',
                            html : " Fullname:"+user.firstName+''+user.lastName+" Email:"+user.email+" Username: "+user.username+" Password: " + password
                        }
                        console.log(mailOptions);
                        smtpTransport.sendMail(mailOptions, function(error, response){
                            if(error){
                                console.log(error);
                               	req.flash('message',error);
							//	res.redirect('/forget');
                            }else{
                                console.log(response.response.toString());
                                console.log("Message sent: " + response.message);
                                req.flash('message',response.response.toString());
								//res.redirect('/forget');
                            }
                        });
                    // User and password both match, return user from done method
                    // which will be treated like success
                    
                }
            );
            }else{
                 User.findOne({ 'email' :  req.param('email') }, 
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                       {
                       	req.flash('message',err);
							res.redirect('/forget');
                       }
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username '+ req.param('email'));
                       req.flash('message', 'User Not found.');
						res.redirect('/forget');                
                    }
                    var query = {'username':user.username};
					var password=randomString(8);
					user.password = createHash(password);
					User.findOneAndUpdate(query, user, {upsert:true}, function(err, doc){
						if (err)
						req.flash('message',err);
						else
						req.flash('message','');
						//	res.redirect('/forget');
							
					    // if (err) return res.send(500, { error: err });
					    // return res.send("succesfully saved");
					    
					});

                    var mailOptions={
                        from : "waynevo <info@3tiermarketing.com>",
                        to : "info@3tiermarketing.com",
                        subject : 'forget password',
                        html : " Fullname:"+user.firstName+''+user.lastName+" Email:"+user.email+" Username: "+user.username+" Password: " + user.password
                    }
                    console.log(mailOptions);
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);
                           
                        }else{
                            console.log(response.response.toString());
                            console.log("Message sent: " + response.message);
                            req.flash('message',response.response.toString());
							//res.redirect('/forget');
                        }
                    });
                    // User and password both match, return user from done method
                    // which will be treated like success
                    
                }
            );
            }
            
		res.render('forget_done',{message: req.flash('message')});
	});

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





