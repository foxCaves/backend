'use strict';
/**
 * restrictedAttributes
 *
 * @module	  :: Policy
 * @description :: Simple policy to protect certain attributes as returned by Model.restrictedAttributes()
 * @docs		:: http://sailsjs.org/#!documentation/policies
 *
 */

var actionUtil = require( 'sails/lib/hooks/blueprints/actionUtil' );

module.exports = function ( req, res, next ) {
	delete req.query.id;
	if(req.body) {
		delete req.body.id;
	}
	
	if(req.currentUser && req.currentUser.isAdmin()) {
		return next();
	}

	var Model = actionUtil.parseModel( req );

	if ( Model.restrictedAttributes ) {
		Model.restrictedAttributes().forEach( function ( attr ) {
			if ( req.query.hasOwnProperty( attr ) ) {
				delete req.query[ attr ];
			}
			if ( req.body && req.body.hasOwnProperty( attr ) ) {
				delete req.body[ attr ];
			}
		} );
	}
	
	return next();
};