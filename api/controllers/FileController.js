'use strict';
/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var mime = require('mime');
var Promise = require('bluebird');

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

var sharp;
try {
	sharp = require('sharp');
} catch(e) {
	 console.warn("Sharp is not installed. Can not render image thumbnails!");
}

module.exports = {
	contents: function contents(req, res) {
		var contentDisposition = req.query.view ? 'inline' : 'attachment';

		var sendData = req.method !== 'HEAD';
		if(sendData && req.method !== 'GET') {
			return res.status(405).json({code: 'E_METHOD_NOT_ALLOWED', error: 'Method not allowed'});
		}

		File.findOneByFileID(req.params.id).then(function(file) {
			if(!file || file.extension !== req.params.extension) {
				res.notFound();
				return;
			}

			var rangeStart, rangeEnd;
			if(req.headers.range) {
				if(!sendData) {
					res.badRequest();
					return;
				}

				var rangeMatch = req.headers.range.match(/^bytes=([0-9]*)-([0-9]*)$/);			
				if(rangeMatch) {
					rangeStart = (rangeMatch[1] === '') ? 0 : rangeMatch[1];
					rangeEnd = (rangeMatch[2] === '') ? file.size - 1 : rangeMatch[2];

					if(rangeEnd >= file.size || rangeEnd < rangeStart || rangeStart < 0) {
						res.status(416).json({code: 'E_INVALID_RANGE', error: 'Invalid range for file'});
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
			if(!stream) {
				return;
			}
			stream.pipe(res);
		}).catch(res.serverError);
	},

	thumbnail: function thumbnail(req, res) {
		var sendData = req.method !== 'HEAD';
		if(sendData && req.method !== 'GET') {
			return res.status(405).json({code: 'E_METHOD_NOT_ALLOWED', error: 'Method not allowed'});
		}

		File.findOneByFileID(req.params.id).then(function(file) {
			if(!file || !file.thumbnailExtension || file.thumbnailExtension !== req.params.thumbextension) {
				return res.notFound();
			}

			res.setHeader('Content-Type', file.thumbnailMimeType);

			if(!sendData) {
				res.ok();
				return;
			}
			return FileService.openThumbnail(file, 'r');
		}).then(function(stream) {
			if(!stream) {
				return;
			}
			stream.pipe(res);
		}).catch(res.serverError);
	},

	create: function create(req, res) {
		var uploadFile = req.file('file');
		if(!uploadFile || !uploadFile.upload) {
			return res.badRequest({code: 'E_MISSING_FILE', error: 'We need a file'});
		}

		var params = req.body;
		params.hidden = true;
		params.owner = req.currentUser.id;
		params.fileID = FileService.generateFileID();

		File.create(params).then(function(file) {
			return Promise.promisify(uploadFile.upload, uploadFile)(FileService.makeReceiver(file)).get(0).then(function(uploadedFile) {
				file.size = uploadedFile.size;
				file.filePath = uploadedFile.fd;

				if(!file.displayName) {
					file.displayName = uploadedFile.filename;
				}
				if(!file.extension) {
					file.extension = uploadedFile.filename.substr(uploadedFile.filename.lastIndexOf('.')+1);
				}

				file.mimeType = mime.lookup(file.extension).toLowerCase();
				if(file.mimeType === 'text/html' || file.mimeType === 'text/javascript') {//We do not want to be XSS'd over!
					file.mimeType = 'text/plain';
				}
				var mimeCategory = file.mimeType.split('/')[0];
				switch(mimeCategory) {
					case 'image':
						if(!sharp) {
							return file;
						}
						return new Promise(function(resolve, reject) {
							var pipeline = sharp().rotate().resize(150, 150).embed().flatten().png().toBuffer(function(err, buffer) {
								if(err) {
									return reject(err);
								}

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
							file.thumbnailExtension = null;
							file.thumbnailMimeType = null;
							delete file.thumbnailExtension;
							delete file.thumbnailMimeType;
							console.log('Error making thumbnail', err);
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
			File.publishCreate(file);
			//TODO: Wait for sails to update and publish the entire object
			User.publishAdd(req.currentUser.id, 'files', file.id, req);
			res.json(file);
		}).catch(res.serverError);
	},

	destroy: function remove(req, res) {
		File.destroy(req.params.id).get(0).then(function(file) {
			FileService.delete(file);
			File.publishDestroy(file.id);
			User.publishRemove(req.currentUser.id, 'files', file.id, req);
			res.json(file);
		});
	},

	find: function find(req, res) {
		File.find()
		.where({
			owner: req.currentUser.id,
			hidden: false
		})
		.where(actionUtil.parseCriteria(req))
		.limit(actionUtil.parseLimit(req))
		.skip(actionUtil.parseSkip(req))
		.sort(actionUtil.parseSort(req))
		.populate('owner')
		.exec(function found(err, matchingRecords) {
			if (err) {
				return res.serverError(err);
			}

			if (req._sails.hooks.pubsub && req.isSocket) {
				File.subscribe(req, matchingRecords);
			}

			res.ok(matchingRecords);
		});
	},

	findOnePublic: function findOne(req, res) {
		File.findOneByFileID(req.params.id).populate('owner').then(function(file) {
			if(!file) {
				return res.notFound();
			}

			if (req._sails.hooks.pubsub && req.isSocket) {
				File.subscribe(req, file);
			}

			res.ok(file);
		}, res.serverError);
	}
};

