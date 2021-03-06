'use strict';
/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow admins or owner to access
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

/* global _ */

var actionUtil = require( 'sails/lib/hooks/blueprints/actionUtil' );

function checkModel(Model, modelInstance, req) {
	if(!modelInstance) {
		throw 'You do not own this record';
	}

	var ownerId = (Model === User) ? modelInstance.id : modelInstance.owner;

	if(ownerId !== req.currentUser.id) {
		throw 'You do not own this record';
	}

	return modelInstance;
}

module.exports = function(req, res, next) {
	delete req.query.id;
	if(req.body) {
		delete req.body.id;
	}
	
	var Model = actionUtil.parseModel( req );

	Model.findOneById(req.params.id).then(function(modelInstance) {
		if(!modelInstance) {
			return false;
		}

		var ownerId = (Model === User) ? modelInstance.id : modelInstance.owner;

		if(ownerId !== req.currentUser.id) {
			return false
		}

		return true;
	}).then(function(allowed) {
		if(allowed) {
			return next();
		}

		return res.forbidden({code: 'E_NOT_OWNED', error: 'You do not own this record'});
	}).catch(res.serverError);
};
