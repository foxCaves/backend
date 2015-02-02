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

module.exports = {
	contents: function contents(req, res) {
		var contentDisposition = req.query.view ? 'inline' : 'attachment';
		var file = sails.models.file.findOneByFileID(req.params.id).then(function(file) {
			if(!file || file.extension.toLowerCase() !== req.params.extension.toLowerCase())
				return res.notFound();

			var path = sails.services.fileservice.getPath(file);

			res.setHeader('Content-Disposition', contentDisposition + '; filename=' + file.displayName);
			res.setHeader('Content-Length', file.size);
			res.setHeader('Content-Type', file.mimeType);

			fs.createReadStream(path).pipe(res);
		}, res.serverError);
	},

	thumbnail: function thumbnail(req, res) {
		if(req.params.thumbextension.toLowerCase() !== 'png')
			return res.notFound();
		var file = sails.models.file.findOneByFileID(req.params.id).then(function(file) {
			if(!file || file.extension.toLowerCase() !== req.params.extension.toLowerCase())
				return res.notFound();
			return sails.services.fileservice.getThumbnailPath(file).then(function(path) {
				res.setHeader('Content-Type', 'image/png');
				fs.createReadStream(path).pipe(res);
			});
		}, res.serverError);
	},

	create: function create(req, res) {
		var uploadFile = req.file('file');
		if(!uploadFile || !uploadFile.upload)
			return res.badRequest("We need a file");

		var Model = sails.models.file;

		var params = req.body;
		params.owner = req.currentUser.id;
		params.fileID = sails.services.fileservice.generateFileID();

		params.mimeType = mime.lookup(params.extension).toLowerCase();
		if(params.mimeType === 'text/html' || params.mimeType === 'text/javascript') //We do not want to be XSS'd over!
			params.mimeType = 'text/plain';

		Model.create(params).then(function(file) {
			var fileName = sails.services.fileservice.getPath(file);
			return Promise.promisify(uploadFile.upload, uploadFile)({
				saveAs: fileName
			}).then(function(uploadedFiles) {
				file.size = uploadedFiles[0].size;
				if(file.mimeType.indexOf('image/') === 0) {
					var sharp = require('sharp');
					var thumbFile = sails.services.fileservice.getStorageThumbnailPath(file, true);
					return sharp(fileName).rotate().resize(150, 150).embed().flatten().png().toFile(thumbFile).then(function() {
						file.hasThumbnail = true;
						return file;
					}, function(err) {
						fs.unlink(thumbFile, function(err) { });
						return file;
					});
				} else {
					return file;
				}
			}, function(err) {
				file.destroy();
				fs.unlink(fileName, function(err) { });
				throw err;
			});
		}).then(function(file) {
			return Promise.promisify(file.save, file)();
		}).then(function(file) {
			Model.publishCreate(file);
			//TODO: Wait for sails to update and publish the entire object
			sails.models.user.publishAdd(req.currentUser.id, 'files', file.id, req);
			res.json(file);
		}).catch(res.serverError);
	},

	destroy: function remove(req, res) {
		var Model = sails.models.file;
		Model.destroy(req.params.id, function(deletedFiles) {
			var file = deletedFiles[0];
			var filePath = sails.services.fileservice.getPath(file);
			fs.unlink(filePath, function(err) { });
			Model.publishDestroy(file.id);
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

