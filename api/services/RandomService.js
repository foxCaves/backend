'use strict';
/**
 * RandomService
 *
 * @description :: Service for giving random strings
 */

var Promise = require('bluebird');
var crypto = Promise.promisifyAll(require('crypto'));

var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateString(len) {
	return crypto.randomBytesAsync(len).then(function(str) {
		for(var i = 0; i < str.length; i++) {
			str[i] = chars.charCodeAt(str[i] % chars.length);
		}
		return ret.toString('ascii');
	});
}

module.exports = {
	generateString: generateString,

	generateFileID: function generateFileID() {
		return generateString(8);
	}
};