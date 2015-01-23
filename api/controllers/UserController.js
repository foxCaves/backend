/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');
 
function tryLoginAs(user, req, res) {
    bcrypt.compare(req.body.password, user.password, function (err, valid) {
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
        User.findOneByEmail(req.body.login).then(function(user) {
            if(!user) {
                return User.findOneByName(req.body.login).then(function(user) {
                    tryLoginAs(user, req, res);
                });
            }
            tryLoginAs(user, req, res);
        });
    },
    
    logout: function(req, res) {
        req.session.userid = null;
        res.json({success: true});
    }
};

