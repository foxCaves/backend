'use strict';
/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var mime = require('mime');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

function streamFile(req, res, contentDisposition) {
	var file = sails.models.file.findOne(req.params.id).then(function(file) {
		if(!file)
			return res.notFound();
		var path = sails.services.fileservice.getPath(file);
		return fs.statAsync(path).then(function(stat) {
			var mimeType = mime.lookup(file.extension);
			if(mimeType == 'text/html' || mimeType == 'text/javascript') //We do not want to be XSS'd over!
				mimeType = 'text/plain';

			res.setHeader('Content-Disposition', contentDisposition + '; filename=' + file.displayName);
			res.setHeader('Content-Length', stat.size);
			res.setHeader('Content-Type', mimeType);

			fs.createReadStream(path).pipe(res);
		});
	}, res.serverError);
}

module.exports = {
	view: function view(req, res) {
		return streamFile(req, res, 'inline');
	},

	download: function download(req, res) {
		return streamFile(req, res, 'attachment');
	},

	create: function create(req, res) {
		var uploadFile = req.file('file');
		if(!uploadFile || !uploadFile.upload)
			return res.badRequest("We need a file");

		var Model = sails.models.file;

		Model.create({
			owner: req.currentUser.id,
			extension: req.body.extension,
			displayName: req.body.displayName,
			fileID: sails.services.fileservice.generateFileID()
		}).then(function(file) {
			uploadFile.upload({
				saveAs: sails.services.fileservice.getPath(file)
			}, function(err, uploadedFiles) {
				if(err) {
					file.destroy();
					return res.serverError(err);
				}
				console.log(uploadedFiles);
				Model.publishCreate(file, req);
				sails.models.user.publishAdd(req.currentUser.id, 'files', file.id, req);
				res.json(file);
			});
		}, res.serverError);
	},

	destroy: function remove(req, res) {
		var Model = sails.models.file;
		Model.destroy(req.params.id, function(deletedFiles) {
			var file = deletedFiles[0];
			var filePath = sails.services.fileservice.getPath(file);
			fs.unlink(filePath, function(err) { });
			Model.publishDestroy(file.id, req);
			sails.models.user.publishRemove(req.currentUser.id, 'files', file.id, req);
			res.json(file);
		});
	}
};

