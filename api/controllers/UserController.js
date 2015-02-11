'use strict';
/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));

function findUserByLogin(login) {
	return User.findOneByEmail(login).then(function(user) {
		if(!user) {
			return User.findOneByName(login);
		}
		return user;
	});
}

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

	console.log('Activation Code for user ', user.name, ' is ', user.emailVerificationCode);
	//TODO: SEND HERE
	return true;
}

function sendPasswordForgot(user) {
	console.log('Password Reset Code for user ', user.name, ' is ', user.passwordResetCode);
	//TODO: SEND HERE
	return true;
}

function updateCurrentUser(req, res, data, noResponse) {
	if(!data.then) {
		data = Promise.resolve(data);
	}
	return data.then(function(data) {
		return User.update(req.currentUser.id, data).get(0).then(function(user) {
			User.publishUpdate(req.currentUser.id, data, req, { previous: req.currentUser });
			sendActivationEmail(req, data);
			if(!noResponse) {
				res.json(user);
			}
		});
	}).catch(res.serverError);
}

module.exports = {
	login: function(req, res) {
		if(!req.body.login || !req.body.password) {
			return res.badRequest({code: 'E_MISSING_PARAMETER', error: 'Login and password fields must be set'});
		}

		findUserByLogin(req.body.login).then(function(user) {
			if(!user) {
				return res.forbidden({code: 'E_INVALID_LOGIN', error: 'Invalid username or password'});
			}
			return bcrypt.compareAsync(req.body.password, user.encryptedPassword).then(function(valid) {
				if(valid) {
					req.session.userid = user.id;
					return res.json(user);
				} else {
					return res.forbidden({code: 'E_INVALID_LOGIN', error: 'Invalid username or password'});
				}
			});
		}).catch(res.serverError);
	},

	activate: function(req, res) {
		if(!req.body.emailVerificationCode)
			return res.badRequest({code: 'E_MISSING_PARAMETER', error: 'Missing parameter emailVerificationCode'});
		if(req.currentUser.isActive())
			return res.json(req.currentUser);

		if(req.body.emailVerificationCode === req.currentUser.emailVerificationCode) {
			updateCurrentUser(req, res, {emailVerificationCode: null});
		} else {
			return res.forbidden({code: 'E_INVALID_CODE', error: 'Wrong code'});
		}
	},

	resendActivation: function(req, res) {
		if(req.currentUser.isActive())
			return res.badRequest({code: 'E_ALREADY_ACTIVE', error: 'Already activated'});
		sendActivationEmail(user);
		res.ok('Activation E-Mail has been resent');
	},

	sendPasswordReset: function(req, res) {
		if(!req.body.login) {
			return res.badRequest({code: 'E_MISSING_PARAMETER', error: 'Login field must be set'});
		}

		findUserByLogin(req.body.login).then(function(user) {
			if(!user) {
				return;
			}

			return RandomService.generatePasswordResetCode().then(function(code) {
				user.passwordResetCode = code;
				return user.save().then(sendPasswordForgot);
			});
		}).then(function() {
			return res.ok('Password forgot E-Mail sent if such user exists');
		}).catch(res.serverError);
	},

	resetPassword: function(req, res) {
		if(!req.body.login || !req.body.passwordResetCode || !req.body.password) {
			return res.badRequest({code: 'E_MISSING_PARAMETER', error: 'Login, passwordResetCode and password fields must be set'});
		}

		findUserByLogin(req.body.login).then(function(user) {
			if(!user || user.passwordResetCode !== req.body.passwordResetCode) {
				return res.forbidden({code: 'E_INVALID_DATA', error: 'Invalid username or reset code'});
			}

			user.password = req.body.password;
			return user.save().then(function() {
				return res.json(user);
			});
		}).catch(res.serverError);
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

