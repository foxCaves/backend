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
	if(req.currentUser && req.currentUser.isActive()) {
		return next();
	}
	return res.forbidden('You are not logged in');
};
