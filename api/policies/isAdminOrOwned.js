/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow admins to access
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	if(req.currentUser && req.currentUser.isAdmin())
		return next();
	next();
};
