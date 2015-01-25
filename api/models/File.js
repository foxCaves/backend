/**
* File.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		displayName: {
			type: "string",
			required: true
		},

		fileID: {
			type: "string",
			unique: true,
			required: true
		},

		owner: {
			model: 'User'
		}
	},

	publicWritable: ['displayName'],
};

