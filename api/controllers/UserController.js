'use strict';
/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));

module.exports = {
	login: function(req, res) {
		if(!req.body.login || !req.body.password)
			return res.badRequest('Login and password fields must be set');

		sails.models.user.findOneByEmail(req.body.login).then(function(user) {
			if(!user)
				return sails.models.user.findOneByName(req.body.login);
			return user;
		}).then(function(user) {
			if(!user)
				return res.forbidden('Invalid username or password');
			return bcrypt.compareAsync(req.body.password, user.encryptedPassword).then(function(valid) {
				if(valid) {
					req.session.userid = user.id;
					return res.json(user);
				} else {
					return res.forbidden('Invalid username or password');
				}
			});
		}).catch(res.serverError);
	},

	getMe: function(req, res) {
		res.json(req.currentUser);
	},

	updateMe: function(req, res) {
		sails.models.user.update(req.currentUser.id, req.body).then(function(users) {
			res.json(users[0]);
		}, res.serverError);
	},
	
	logout: function(req, res) {
		req.session.userid = null;
		res.json({success: true});
	}
};

