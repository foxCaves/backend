'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

module.exports = {
	open: function openFile (file, mode) {
		return fs.openAsync(sails.config.foxcaves.storage + '/' + file.fileID + '.' + file.extension, mode);
	}
};