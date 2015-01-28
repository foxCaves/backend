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

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

function streamFile(req, res, contentDisposition) {
	var file = sails.models.file.findOne(req.params.id).then(function(file) {
		if(!file || file.extension !== req.params.extension)
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

		var params = req.body;
		params.owner = req.currentUser.id;
		params.fileID = sails.services.fileservice.generateFileID();
		Model.create(params).then(function(file) {
			uploadFile.upload({
				saveAs: sails.services.fileservice.getPath(file)
			}, function(err, uploadedFiles) {
				if(err) {
					file.destroy();
					return res.serverError(err);
				}
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
	},

	find: function find(req, res) {
		var Model = sails.models.file;

		var query = Model.find()
			.where({ owner: req.currentUser.id })
			.where( actionUtil.parseCriteria(req) )
			.limit( actionUtil.parseLimit(req) )
			.skip( actionUtil.parseSkip(req) )
			.sort( actionUtil.parseSort(req) );
			// TODO: .populateEach(req.options);

		query = actionUtil.populateEach(query, req);
		query.exec(function found(err, matchingRecords) {
			if (err)
				return res.serverError(err);

			// Only `.watch()` for new instances of the model if
			// `autoWatch` is enabled.
			if (req._sails.hooks.pubsub && req.isSocket) {
				Model.subscribe(req, matchingRecords);
				// Also subscribe to instances of all associated models
				_.each(matchingRecords, function (record) {
					actionUtil.subscribeDeep(req, record);
				});
			}

			res.ok(matchingRecords);
		});
	}
};

