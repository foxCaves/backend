'use strict';
/**
 * ConfigController
 *
 * @description :: Server-side logic for dispensing config values
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	csrfToken: function csrfToken(req, res) {
		res.json({_csrf: res.locals._csrf || 'DUMMY'});
	},

	captcha: function captcha(req, res) {
		res.setHeader('Content-Type', 'text/plain');
		res.write(CaptchaService.getHTML(req.body));
		res.end();
	}
};
