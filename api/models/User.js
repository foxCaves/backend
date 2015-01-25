'use strict';
/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));

module.exports = {
	attributes: {
		name: {
			type: 'string',
			unique: true,
			required: true
		},
		
		email: {
			type: 'email',
			unique: true,
			required: true
		},
		
		admin: {
			type: 'boolean',
			default: false
		},
		
		password: {
			type: 'string',
			required: true
		},

		files: {
			collection: 'File',
			via: 'owner'
		},
				   
		isAdmin: function() {
			return this.admin;
		},

		toJSON: function() {
		  var obj = this.toObject();
		  delete obj.password;
		  delete obj.email_verification_code;
		  return obj;
		}
	},

	restrictedAttributes: function () {
	    return [ 'id', 'admin', 'files', 'email_verification_code' ];
	},
	
	beforeCreate: function (attrs, next) {
		return this.filterUpdate(attrs, next);
	},

	beforeUpdate: function (attrs, next) {
		return this.filterUpdate(attrs, next);
	},
	
	filterUpdate: function (attrs, next) {
		if(attrs.password) {
			bcrypt.genSaltAsync(10).then(function(salt) {
				return bcrypt.hashAsync(attrs.password, salt);
			}).then(function(hash) {
				attrs.password = hash;
				next();
			}, next);
		} else {
			next();
		}
	}
};

