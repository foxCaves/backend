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
			if(!file || file.extension !== req.params.extension) {
				res.notFound();
				return;
			}

			var sendData = (req.method !== 'HEAD' && req.method !== 'OPTIONS');

			var rangeStart, rangeEnd;
			if(req.headers.range) {
				if(!sendData) {
					res.badRequest();
					return;
				}

				var rangeMatch = req.headers.range.match(/^bytes=([0-9]*)-([0-9]*)$/);			
				if(rangeMatch) {
					rangeStart = (rangeMatch[1] === '') ? 0 : rangeMatch[1];
					rangeEnd = (rangeMatch[2] === '') ? (file.size - 1) : rangeMatch[2];

					if(rangeEnd >= file.size || rangeEnd < rangeStart || rangeStart < 0) {
						res.status(416).json("Invalid range for file");
						return;
					}
				} else {
					res.badRequest();
					return;
				}
			}

			res.setHeader('Accept-Range', 'bytes');
			res.setHeader('Content-Disposition', contentDisposition + '; filename=' + file.displayName);
			res.setHeader('Content-Type', file.mimeType);

			if(rangeStart === undefined) {
				res.setHeader('Content-Length', file.size);
				if(!sendData) {
					res.ok();
					return;
				}
				return FileService.open(file, 'r');
			} else {
				res.setHeader('Content-Length', (rangeEnd - rangeStart) + 1);
				res.setHeader('Content-Range', 'bytes ' + rangeStart + '-' + rangeEnd + '/' + file.size);
				res.status(206);
				return FileService.open(file, 'r', {range: {startPos: rangeStart, endPos: rangeEnd}});
			}
		}).then(function(stream) {
			if(!stream)
				return;
			stream.pipe(res);
		}).catch(res.serverError);
	},

	thumbnail: function thumbnail(req, res) {
		sails.models.file.findOneByFileID(req.params.id).then(function(file) {
			if(!file || !file.thumbnailExtension || file.thumbnailExtension !== req.params.thumbextension)
				return res.notFound();

			var sendData = (req.method !== 'HEAD' && req.method !== 'OPTIONS');

			res.setHeader('Content-Type', file.thumbnailMimeType);
			
			if(!sendData) {
				res.ok();
				return;
			}
			return FileService.openThumbnail(file, 'r');
		}).then(function(stream) {
			if(!stream)
				return;
			stream.pipe(res);
		}).catch(res.serverError);
	},

	create: function create(req, res) {
		var uploadFile = req.file('file');
		if(!uploadFile || !uploadFile.upload)
			return res.badRequest("We need a file");

		var Model = sails.models.file;

		var params = req.body;
		params.hidden = true;
		params.owner = req.currentUser.id;
		params.fileID = FileService.generateFileID();

		Model.create(params).then(function(file) {
			return Promise.promisify(uploadFile.upload, uploadFile)(FileService.makeReceiver(file)).then(function(uploadedFiles) {
				return uploadedFiles[0];
			}).then(function(uploadedFile) {
				file.size = uploadedFile.size;
				file.filePath = uploadedFile.fd;

				if(!file.displayName)
					file.displayName = uploadedFile.filename;
				if(!file.extension)
					file.extension = uploadedFile.filename.substr(uploadedFile.filename.lastIndexOf('.')+1);

				file.mimeType = mime.lookup(file.extension).toLowerCase();
				if(file.mimeType === 'text/html' || file.mimeType === 'text/javascript') //We do not want to be XSS'd over!
					file.mimeType = 'text/plain';

				var mimeCategory = file.mimeType.split('/')[0];
				switch(mimeCategory) {
					case 'image':
						var sharp = require('sharp');
						return new Promise(function(resolve, reject) {
							var pipeline = sharp().rotate().resize(150, 150).embed().flatten().png().toBuffer(function(err, buffer, info) {
								if(err)
									return reject(err);

								file.thumbnailExtension = 'png';
								file.thumbnailMimeType = 'image/png';

								FileService.openThumbnail(file, 'w').then(function(stream) {
									stream.on('close', function() {
										return resolve(file);
									});
									stream.write(buffer);
									stream.end();
								}, function(err) {
									return reject(err);
								});
							});

							FileService.open(file, 'r').then(function(stream) {
								stream.pipe(pipeline);
							}, function(err) {
								return reject(err);
							});
						}). catch(function(err) {
							console.log("Error making thumbnail", err);
							return file;
						});
					case 'text': //TODO: Write this
						return file;
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

