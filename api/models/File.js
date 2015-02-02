'use strict';
/**
* File.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		displayName: {
			type: 'string',
			required: true
		},

		fileID: {
			type: 'string',
			unique: true,
			required: true
		},

		extension: {
			type: 'string',
			required: true
		},

		mimeType: {
			type: 'string',
			required: true
		},

		hasThumbnail: {
			type: 'boolean'
		},

		owner: {
			model: 'User'
		}
	},

	restrictedAttributes: function () {
	    return [ 'id', 'fileID', 'owner', 'mimeType', 'size' ];
	},

	beforeCreate: function (attrs, next) {
		attrs.fileID = 'rand_' + new Date().getTime();
		return this.filterUpdate(attrs, next);
	},

	beforeUpdate: function (attrs, next) {
		return this.filterUpdate(attrs, next);
	},
	
	filterUpdate: function (attrs, next) {
		next();
	}
};

