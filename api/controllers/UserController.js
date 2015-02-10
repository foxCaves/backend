'use strict';
/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));

function checkRequireActivation(req, user) {
	if(req.body.email && (!user || user.email !== req.body.email)) {
		return RandomService.generateEmailVerificationCode().then(function(code) {
			req.body.emailVerificationCode = code;
			return req;
		});
	}
	return Promise.resolve(req);
}

function checkSendActivation(req, user) {
	if(!req.body.emailVerificationCode) {
		return;
	}

	console.log('Code for user ', user.name, ' is ', user.emailVerificationCode);
	//TODO: SEND HERE
}

function updateCurrentUser(req, res, data, promise) {
	promise = promise || Promise.resolve(req);
	return promise.then(function(req) {
		return User.update(req.currentUser.id, data || req.body);
	}).get(0).then(function(user) {
		User.publishUpdate(req.currentUser.id, req.body, req, { previous: req.currentUser });
		checkSendActivation(req, user);
		res.json(user);
	}).catch(res.serverError);
}

module.exports = {
	login: function(req, res) {
		if(!req.body.login || !req.body.password) {
			return res.badRequest('Login and password fields must be set');
		}

		User.findOneByEmail(req.body.login).then(function(user) {
			if(!user) {
				return User.findOneByName(req.body.login);
			}
			return user;
		}).then(function(user) {
			if(!user) {
				return res.forbidden('Invalid username or password');
			}
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

	activate: function(req, res) {
		if(!req.currentUser)
			return res.forbidden('You are not logged in');
		if(!req.body.emailVerificationCode)
			return res.badRequest('Missing parameter emailVerificationCode');
		if(req.currentUser.isActive())
			return res.json(req.currentUser);

		if(req.body.emailVerificationCode === req.currentUser.emailVerificationCode) {
			updateCurrentUser(req, res, {emailVerificationCode: null});
		} else {
			return res.forbidden('Wrong code');
		}
	},

	create: function(req, res) {
		if(req.currentUser)
			return res.forbidden('You are logged in');

		checkRequireActivation(req, null).then(function(req) {
			return User.create(req.body);
		}).then(function(user) {
			req.session.userid = user.id;
			checkSendActivation(req, user);
			res.json(user);
		}).catch(res.serverError);
	},

	get: function(req, res) {
		res.json(req.currentUser);
	},

	update: function(req, res) {
		updateCurrentUser(req, res, null, checkRequireActivation(req, req.currentUser));
	},
	
	logout: function(req, res) {
		req.session.userid = null;
		res.json({success: true});
	}
};

