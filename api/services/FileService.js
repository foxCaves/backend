'use strict';

function getPath(file) {
	return sails.config.foxcaves.storage + '/' + file.fileID + '.' + file.extension;
}

module.exports = {
	getPath: getPath,
	generateFileID: function generateFileID() {
		return 'file_' + new Date().getTime();
	}
};