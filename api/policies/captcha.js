'use strict';
/**
 * CAPTCHA
 *
 * @module      :: Policy
 * @description :: Policy to verify current route access via reCAPTCHA
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function(req, res, next) {
	sails.services.captchaservice.verify(req).then(function() {
		return next();
	}, function(msg) {
		var reason;
		if(msg && msg.cause && msg.cause.message) {
			reason = msg.cause.message;
		} else {
			reason = 'unknown';
		}

		res.forbidden({
			error: 'Wrong CAPTCHA',
			reason: reason
		});
	});
};
