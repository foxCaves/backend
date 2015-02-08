'use strict';
/**
 * CaptchaService
 *
 * @description :: Service for handling captchas
 */

var Promise = require('bluebird');

if(sails.config.foxcaves.recaptcha.enabled) {
	var NoCaptcha = require('no-captcha');
	Promise.promisifyAll(require('no-captcha').prototype);
	var noCaptcha = new NoCaptcha(sails.config.foxcaves.recaptcha.public, sails.config.foxcaves.recaptcha.private);

	module.exports = {
		verify: function verify (req) {
			var captchaResponse = req.body['g-recaptcha-response'];
			delete req.body['g-recaptcha-response'];
			return noCaptcha.verifyAsync({
				response: captchaResponse,
				remoteip: req.connection.remoteAddress
			});
		},

		getHTML: function getHTML(options) {
			return noCaptcha.toHTML(options);
		},

		isEnabled: function() {
			return true;
		} 
	};
} else {
	module.exports = {
		verify: function verify() {
			return Promise.resolve();
		},

		getHTML: function getHTML() {
			return '';
		},

		isEnabled: function() {
			return false;
		} 
	};
}