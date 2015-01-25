'use strict';

module.exports.policies = {

	'*': ['auth', 'isLoggedIn', 'isAdmin'],
  
	UserController: {
		login: true,
		logout: true,
		
		create: 'restrictedAttributes',

		populate: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		add: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		remove: ['auth', 'isLoggedIn', 'isAdminOrOwned'],

		findOne: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		update: ['auth', 'isLoggedIn', 'isAdminOrOwned', 'restrictedAttributes']
	},

	FileController: {
		findOne: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		update: ['auth', 'isLoggedIn', 'isAdminOrOwned', 'restrictedAttributes'],
	}
};
