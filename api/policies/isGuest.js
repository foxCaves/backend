'use strict';
/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow logged in users to access
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	if(!req.currentUser) {
		return next();
	}
	return res.forbidden({code: 'E_NOT_GUEST', error: 'You are logged in'});
};
