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

//var FileService = sails.services.fileservice;

module.exports = {
	contents: function contents(req, res) {
		var contentDisposition = req.query.view ? 'inline' : 'attachment';
		sails.models.file.findOneByFileID(req.params.id).then(function(file) {
			if(!file || file.extension !== req.params.extension)
				return res.notFound();

			var rangeStart, rangeEnd;
			if(req.headers.range) {
				var rangeMatch = req.headers.range.match(/^bytes=([0-9]+)-([0-9]+)$/);			
				if(rangeMatch) {
					rangeStart = parseInt(rangeMatch[1]);
					rangeEnd = parseInt(rangeMatch[2]);
					if(rangeEnd >= file.size || rangeEnd < rangeStart || rangeStart < 0)
						return res.status(416).json("Invalid range for file");
				} else {
					return res.badRequest();
				}
			}

			res.setHeader('Accept-Range', 'bytes');
			res.setHeader('Content-Disposition', contentDisposition + '; filename=' + file.displayName);
			res.setHeader('Content-Type', file.mimeType);

			if(rangeStart === undefined) {
				res.setHeader('Content-Length', file.size);
				res.status(206);
				return FileService.open(file, 'r');
			} else {
				res.setHeader('Content-Length', (rangeEnd - rangeStart) + 1);
				res.setHeader('Content-Range', 'bytes ' + rangeStart + '-' + rangeEnd + '/' + file.size);
				return FileService.open(file, 'r', {range: {startPos: rangeStart, endPos: rangeEnd}});
			}
		}).then(function(stream) {
			stream.pipe(res);
		}).catch(res.serverError);
	},

	thumbnail: function thumbnail(req, res) {
		sails.models.file.findOneByFileID(req.params.id).then(function(file) {
			if(!file || !file.thumbnailExtension || file.thumbnailExtension !== req.params.thumbextension)
				return res.notFound();

			var path = FileService.getThumbnailPath(file);

			res.setHeader('Content-Type', file.thumbnailMimeType);

			fs.createReadStream(path).pipe(res);
		}, res.serverError);
	},

	create: function create(req, res) {
		var uploadFile = req.file('file');
		if(!uploadFile || !uploadFile.upload)
			return res.badRequest("We need a file");

		var Model = sails.models.file;

		var params = req.body;
		params.extension = params.extension.toLowerCase();
		params.hidden = true;
		params.owner = req.currentUser.id;
		params.fileID = FileService.generateFileID();

		params.mimeType = mime.lookup(params.extension).toLowerCase();
		if(params.mimeType === 'text/html' || params.mimeType === 'text/javascript') //We do not want to be XSS'd over!
			params.mimeType = 'text/plain';

		Model.create(params).then(function(file) {
			return Promise.promisify(uploadFile.upload, uploadFile)(FileService.makeReceiver(file)).then(function(uploadedFiles) {
				return uploadedFiles[0];
			}).then(function(uploadedFile) {
				file.size = uploadedFile.size;
				file.filePath = uploadedFile.fd;

				var mimeCategory = file.mimeType.split('/')[0];
				switch(mimeCategory) {
					/*case 'image':
						var sharp = require('sharp');
						var thumbFile = sails.services.fileservice.getThumbnailPath(file, 'png');
						return sharp(fileName).rotate().resize(150, 150).embed().flatten().png().toFile(thumbFile).then(function() {
							file.thumbnailExtension = 'png';
							file.thumbnailMimeType = 'image/png';
							return file;
						}, function(err) {
							fs.unlink(thumbFile, function(err) { });
							return file;
						});
					case 'text': //TODO: Write this
						return file;*/
					default:
						return file;
				}
			}, function(err) {
				FileService.delete(file);
				file.destroy();
				throw err;
			});
		}).then(function(file) {
			file.hidden = false;
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
			FileService.delete(file);
			Model.publishDestroy(file.id);
			sails.models.user.publishRemove(req.currentUser.id, 'files', file.id, req);
			res.json(file);
		});
	},

	find: function find(req, res) {
		var Model = sails.models.file;

		Model.find()
		.where({ owner: req.currentUser.id, hidden: false })
		.where( actionUtil.parseCriteria(req) )
		.limit( actionUtil.parseLimit(req) )
		.skip( actionUtil.parseSkip(req) )
		.sort( actionUtil.parseSort(req) )
		.populate('owner')
		.exec(function found(err, matchingRecords) {
			if (err)
				return res.serverError(err);

			if (req._sails.hooks.pubsub && req.isSocket) {
				Model.subscribe(req, matchingRecords);
			}

			res.ok(matchingRecords);
		});
	},

	findOnePublic: function findOne(req, res) {
		sails.models.file.findOneByFileID(req.params.id).populate('owner').then(function(file) {
			if(!file)
				return res.notFound();

			if (req._sails.hooks.pubsub && req.isSocket) {
				Model.subscribe(req, file);
			}

			res.ok(file);
		}, res.serverError);
	}
};

