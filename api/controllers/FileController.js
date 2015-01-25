/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function create(req, res) {
		var data = ModelService.getFilteredParams(File, req.body);
		data.owner = req.currentUser;
		data.fileID = 'rand_' + new Date().getTime();
		File.create(data).then(function(file) {
			User.publishAdd(req.currentUser.id, 'files', file.id, req);
			res.json(file);
		}, res.serverError);
	},

	subscribe: function(req, res) {
		
	}
};

