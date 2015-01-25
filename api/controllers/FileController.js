/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'); 

module.exports = {
	create: function create(req, res) {
		var data = ModelService.getFilteredParams(File, req.body);
		data.owner = req.currentUser;
		data.fileID = 'rand_' + new Date();
		File.create(data).then(function(file) {
			res.json(file);
		}, res.serverError);
	},

	update: function update(req, res) {
		ModelService.setRestricted(File, req.body, req.param.id).then(function(file) {
			res.json(file);
		}, res.serverError);
	},

	find: function find(req, res) {
		var query = Model.findByOwner(req.currentUser)
			.where( actionUtil.parseCriteria( req ) )
			.limit( actionUtil.parseLimit( req ) )
			.skip( actionUtil.parseSkip( req ) )
			.sort( actionUtil.parseSort( req ) );
		query = actionUtil.populateEach( query, req );
		query.exec(function (err, matchingRecords) {
			res.json(matchingRecords);
		});
	}
};

