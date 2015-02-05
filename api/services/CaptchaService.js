var Promise = require('bluebird');
var NoCaptcha = require('no-captcha');
Promise.promisifyAll(require('no-captcha').prototype);

var noCaptcha = new NoCaptcha(sails.config.foxcaves.recaptcha.public, sails.config.foxcaves.recaptcha.private);

function isEnabled() {
	return sails.config.foxcaves.recaptcha.enabled;
};

module.exports = {
	verify: function verify (req) {
		if(!isEnabled())
			return Promise.resolve();

		var captchaResponse = req.body['g-recaptcha-response'];
		delete req.body['g-recaptcha-response'];
		return noCaptcha.verifyAsync({
			response: captchaResponse,
			remoteip: req.connection.remoteAddress
		});
	},

	getHTML :  function getHTML(options) {
		if(!isEnabled())
			return '';
		return noCaptcha.toHTML(options);
	},

	isEnabled: isEnabled 
};