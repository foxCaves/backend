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
	return crypto.randomBytesAsync(len).then(function(buffer) {
		for(var i = 0; i < buffer.length; i++) {
			buffer[i] = chars.charCodeAt(buffer[i] % chars.length);
		}
		return buffer.toString('ascii');
	});
}

module.exports = {
	generateString: generateString,

	generateEmailVerificationCode: function generateEmailVerificationCode() {
		return generateString(24);
	},

	generatePasswordResetCode: function generatePasswordResetCode() {
		return generateString(32);
	},

	generateFileID: function generateFileID() {
		return generateString(10);
	}
};