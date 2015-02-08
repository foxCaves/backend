'use strict';
/**
 * findOnlyOwned
 *
 * @module      :: Policy
 * @description :: Simple policy to allow admins or owner to access
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function(req, res, next) {
	if(req.params.id || req.query.id || (req.body && req.body.id)) {
		return res.forbidden('Use findOne route');
	}

	req.params.owner = req.currentUser.id;
	req.query.owner = req.currentUser.id;
	if(req.body) {
		req.body.owner = req.currentUser.id;
	}
	next();
};
