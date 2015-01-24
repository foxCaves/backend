/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');
 
function tryLoginAs(user, req, res) {
    bcrypt.compare(req.body.password, user.password, function (err, valid) {
        if(err)
            res.serverError(err);

        if(valid) {
            req.session.userid = user.id;
            res.json(user);
        } else {
            res.forbidden('Invalid password');
        }
    });
}
 
module.exports = {
	login: function(req, res) {
        if(!req.body.login || !req.body.password)
            return res.badRequest("Login and password fields must be set");

        User.findOneByEmail(req.body.login).then(function(user) {
            if(!user) {
                return User.findOneByName(req.body.login).then(function(user) {
                    tryLoginAs(user, req, res);
                }, res.serverError);
            }
            tryLoginAs(user, req, res);
        }, res.serverError);
    },
    
    logout: function(req, res) {
        req.session.userid = null;
        res.json({success: true});
    },
    
    register: function(req, res) {
        UserService.setRestricted(req.body).then(function(user) {
            res.json(user);
        }, res.serverError);
    },
    
    me: function(req, res) {
        UserService.getCurrent(req).then(function(user) {
            res.json(user);
        }, res.serverError);
    },
    
    setMe: function(req, res) {
        UserService.setRestricted(req.body, req.session.userid).then(function(user) {
            res.json(user);
        }, res.serverError);
    }
};

