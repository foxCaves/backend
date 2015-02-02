'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var thumbExistanceCache = {};

function getPath(file) {
	return sails.config.foxcaves.storage + '/files/' + file.fileID + '.' + file.extension;
}

function getStorageThumbnailPath(file) {
	return sails.config.foxcaves.storage + '/thumbs/' + file.fileID + '.' + file.extension + '.png';
}

function getThumbnailPath(file) {
	if(file.hasThumbnail)
		return Promise.resolve(getStorageThumbnailPath(file));

	var thumbPath = sails.config.foxcaves.storage + '/default_thumbs/' + file.extension + '.png';

	return Promise.resolve(thumbExistanceCache[file.extension]).then(function(exists) {
		if(exists === true || exists === false)
			return exists;
		return fs.statAsync(thumbPath).then(function(stat) {
			thumbExistanceCache[file.extension] = true;
			return true;
		}, function(err) {
			thumbExistanceCache[file.extension] = false;
			return false;
		});
	}).then(function(exists) {
		if(exists)
			return thumbPath;
		else
			return sails.config.foxcaves.storage + '/default_thumbs/default.file.png';
	});
}

module.exports = {
	getPath: getPath,
	getStorageThumbnailPath: getStorageThumbnailPath,
	getThumbnailPath: getThumbnailPath,
	generateFileID: function generateFileID() {
		return 'file_' + new Date().getTime();
	}
};
