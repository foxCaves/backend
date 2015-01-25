'use strict';
/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow admins or owner to access
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var actionUtil = require( 'sails/lib/hooks/blueprints/actionUtil' );

module.exports = function(req, res, next) {
	delete req.query.id;
	if(req.body)
		delete req.body.id;
	
	if(req.currentUser && req.currentUser.isAdmin())
		return next();
	var Model = actionUtil.parseModel( req );
	
	Model.findOneById(req.params.parentid || req.params.id).then(function (modelInstance) {
		if(!modelInstance)
			return res.forbidden('You do not own this record');

		var ownerId = (Model === sails.models.user) ? modelInstance.id : modelInstance.owner;

		if(ownerId !== req.currentUser.id)
			return res.forbidden('You do not own this record');

		next();
	}, next);
};
