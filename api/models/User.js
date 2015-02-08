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
		
		encryptedPassword: {
			type: 'string'
		},

		emailVerificationCode: {
			type: 'string'
		},

		passwordResetCode: {
			type: 'string'
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
			delete obj.encryptedPassword;
			delete obj.emailVerificationCode;
			delete obj.passwordResetCode;
			return obj;
		}
	},

	restrictedAttributes: function () {
		return [
			'id',
			'admin',
			'files',
			'encryptedPassword',
			'emailVerificationCode',
			'passwordResetCode'
		];
	},

	requireActivationEmail: function () {

	},
	
	beforeCreate: function (attrs, next) {
		if(!attrs.password) {
			return next('Password is required');
		}
		return this.filterUpdate(attrs).then(next, next);
	},

	beforeUpdate: function (attrs, next) {
		return this.filterUpdate(attrs).then(next, next);
	},
	
	filterUpdate: function (attrs) {
		if(attrs.password) {
			return bcrypt.genSaltAsync(10).then(function(salt) {
				return bcrypt.hashAsync(attrs.password, salt);
			}).then(function(hash) {
				attrs.encryptedPassword = hash;
			});
		}
		return Promise.resolve();
	}
};

