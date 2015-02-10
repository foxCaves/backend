'use strict';
/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));

function checkRequireActivation(data, user) {
	if(data.email && (!user || user.email !== data.email)) {
		return RandomService.generateEmailVerificationCode().then(function(code) {
			data.emailVerificationCode = code;
			return data;
		});
	}
	return Promise.resolve(data);
}

function sendActivationEmail(user, data) {
	if(data && !data.emailVerificationCode) {
		return false;
	}

	console.log('Code for user ', user.name, ' is ', user.emailVerificationCode);
	//TODO: SEND HERE
	return true;
}

function updateCurrentUser(req, res, data) {
	if(!data.then) {
		data = Promise.resolve(data);
	}
	return data.then(function(data) {
		return User.update(req.currentUser.id, data).get(0).then(function(user) {
			User.publishUpdate(req.currentUser.id, data, req, { previous: req.currentUser });
			sendActivationEmail(req, data);
			res.json(user);
		});
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

	resendActivation: function(req, res) {
		if(req.currentUser.isActive())
			return res.badRequest('Already activated');
		sendActivationEmail(user);
		res.ok('Activation E-Mail has been resent');
	},

	create: function(req, res) {
		checkRequireActivation(req.body, null).then(function(data) {
			return User.create(data);
		}).then(function(user) {
			req.session.userid = user.id;
			sendActivationEmail(user);
			res.json(user);
		}).catch(res.serverError);
	},

	get: function(req, res) {
		res.json(req.currentUser);
	},

	update: function(req, res) {
		updateCurrentUser(req, res, checkRequireActivation(req.body, req.currentUser));
	},
	
	logout: function(req, res) {
		req.session.userid = null;
		res.json({success: true});
	}
};

