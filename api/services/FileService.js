'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var thumbExistanceCache = {};

function getPath(file) {
	return sails.config.foxcaves.storage + '/files/' + file.fileID + '.' + file.extension;
}

function getThumbnailPath(file, extension) {
	return sails.config.foxcaves.storage + '/thumbs/' + file.fileID + '.' + file.extension + '.' + (extension || file.thumbnailExtension);
}

module.exports = {
	getPath: getPath,
	getThumbnailPath: getThumbnailPath,
	generateFileID: function generateFileID() {
		return 'file_' + new Date().getTime();
	}
};
