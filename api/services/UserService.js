'use strict';

var Promise = require('bluebird');

module.exports = {
	checkRequireActivation: function(req, user) {
		if(req.body.email && (!user || user.email !== req.body.email)) {
			return RandomService.generateString(24).then(function(code) {
				req.body.emailVerificationCode = code;
				return req;
			});
		}
		return Promise.resolve(req);
	},

	checkSendActivation: function(req, user) {
		if(!req.body.emailVerificationCode) {
			return;
		}

		console.log('Code for user ', user.name, ' is ', user.emailVerificationCode);
		//TODO: SEND HERE
	}
};