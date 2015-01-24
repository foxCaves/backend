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
                }).catch(res.serverError);
            }
            tryLoginAs(user, req, res);
        }).catch(res.serverError);
    },
    
    logout: function(req, res) {
        req.session.userid = null;
        res.json({success: true});
    },
    
    me: function(req, res) {
        UserService.getCurrentUser(req).then(function(user) {
            res.json(user);
        }).catch(res.serverError);
    },
    
    setMe: function(req, res) {
         UserService.getCurrentUser(req).then(function(user) {
             if(req.body.password)
                 user.password = req.body.password;
             if(req.body.email)
                 user.email = req.body.email;
             user.save(function(err, user) {
                 if(err)
                     return res.serverError(err);
                 res.json(user);
             });
        }).catch(res.serverError);       
    }
};

