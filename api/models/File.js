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
			model: 'User'
		},

		toJSON: function() {
			var obj = this.toObject();
			delete obj.hidden;
			if(obj.owner && obj.owner.name)
				obj.owner = obj.owner.name;
			else
				delete obj.owner;
			return obj;
		}
	},

	restrictedAttributes: function () {
	    return [ 'id', 'fileID', 'owner', 'mimeType', 'thumbnailExtension', 'thumbnailMimeType', 'size', 'hidden' ];
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

