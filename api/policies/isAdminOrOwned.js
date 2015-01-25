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

	var checkModel = function checkModel(Model, modelInstance) {
		if(!modelInstance)
			throw 'You do not own this record';

		var ownerId = (Model === sails.models.user) ? modelInstance.id : modelInstance.owner;

		if(ownerId !== req.currentUser.id)
			throw 'You do not own this record';

		return modelInstance;
	};

	var endPromise = Model.findOneById(req.params.parentid || req.params.id).then(function(modelInstance) {
		return checkModel(Model, modelInstance);
	});
	
	if(req.params.parentid && req.params.id) {
		endPromise = endPromise.then(function(parentModelInstance) {
			var associationAttr = _.findWhere(Model.associations, { alias: req.options.alias });
			var ChildModel = sails.models[associationAttr.collection];
			return ChildModel.findOneById(req.params.id).then(function(modelInstance) {
				return checkModel(ChildModel, modelInstance);
			});
		});
	}

	endPromise.then(next, next);
};
