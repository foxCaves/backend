'use strict';

function getPath(file) {
	return sails.config.foxcaves.storage + '/files/' + file.fileID + '.' + file.extension;
}

function getThumbnailPath(file, force) {
	if(file.hasThumbnail || force)
		return sails.config.foxcaves.storage + '/thumbs/' + file.fileID + '.' + file.extension + '.png';
	return sails.config.foxcaves.storage + '/default_thumbs/' + file.extension + '.png';
}

module.exports = {
	getPath: getPath,
	getThumbnailPath: getThumbnailPath,
	generateFileID: function generateFileID() {
		return 'file_' + new Date().getTime();
	}
};
