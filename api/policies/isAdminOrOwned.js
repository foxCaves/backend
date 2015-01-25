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
	if(req.currentUser && req.currentUser.isAdmin())
		return next();
	var Model = actionUtil.parseModel( req );

	delete req.query.id;
	if(req.body)
		delete req.body.id;
	
	Model.findOneById(req.params.id).then(function (modelInstance) {
		var ownerId;
		if(Model === User)
			ownerId = modelInstance.id;
		else
			ownerId = modelInstance.owner;

		if(ownerId !== req.currentUser.id)
			return res.forbidden('You do not own this record');

		next();
	}, next);
};
