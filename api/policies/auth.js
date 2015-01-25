'use strict';
/**
 * auth
 *
 * @module      :: Policy
 * @description :: Simple policy to add currentUser to req
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function(req, res, next) {
	var userid = req.session.userid;
	if(userid) {
		sails.models.user.findOneById(userid).then(function(user) {
			req.currentUser = user;
			next();
		}, next);
	} else {
		req.currentUser = null;
		next();
	}
};
