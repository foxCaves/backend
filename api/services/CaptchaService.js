var Promise = require('bluebird');
var NoCaptcha = require('no-captcha');
Promise.promisifyAll(require('no-captcha').prototype);

var noCaptcha = new NoCaptcha(sails.config.foxcaves.recaptcha.public, sails.config.foxcaves.recaptcha.private);

module.exports = {
	verify: function verify (req) {
		if(!sails.config.foxcaves.recaptcha.enabled)
			return Promise.resolve();

		var captchaResponse = req.body['g-recaptcha-response'];
		delete req.body['g-recaptcha-response'];
		return noCaptcha.verifyAsync({
			response: captchaResponse,
			remoteip: req.connection.remoteAddress
		});
	}
};