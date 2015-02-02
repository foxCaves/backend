'use strict';
/**
 * CsrfTokenController
 *
 * @description :: Server-side logic for dispensing csrf tokens
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index: function csrfToken(req, res) {
		res.json({_csrf: res.locals._csrf || "DUMMY"});
	}
};
