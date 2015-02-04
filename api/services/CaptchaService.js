var NoCaptcha = require('no-captcha');
var Promise = require('bluebird');

var noCaptcha = Promise.promisifyAll(new NoCaptcha(sails.config.foxcaves.recaptcha.public, sails.config.foxcaves.recaptcha.private));

module.exports = {
	verify: function verify (req) {
		return noCaptcha.verifyAsync({
			response: req.body['g-recaptcha-response'],
			remoteip: req.connection.remoteAddress
		});
	}
};