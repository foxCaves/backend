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
			type: 'string'
		},

		fileID: {
			type: 'string',
			unique: true,
			required: true
		},

		extension: {
			type: 'string'
		},

		mimeType: {
			type: 'string'
		},

		thumbnailExtension: {
			type: 'string'
		},

		thumbnailMimeType: {
			type: 'string'
		},

		size: {
			type: 'integer'
		},

		hidden: {
			type: 'boolean',
			required: true
		},

		owner: {
			model: 'User',
			required: true
		},

		filePath: {
			type: 'string'
		},

		thumbnailPath: {
			type: 'string'
		},

		toJSON: function() {
			var obj = this.toObject();
			delete obj.hidden;
			delete obj.filePath;
			delete obj.thumbnailPath;
			if(obj.owner && obj.owner.name)
				obj.owner = obj.owner.name;
			else
				delete obj.owner;
			return obj;
		}
	},

	restrictedAttributes: function () {
	    return [ 'id', 'fileID', 'owner', 'mimeType', 'thumbnailExtension', 'thumbnailMimeType', 'filePath', 'thumbnailPath', 'size', 'hidden' ];
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

