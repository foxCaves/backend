'use strict';

module.exports.policies = {

	'*': false,
  
	UserController: {
		login: true,
		logout: true,
		
		create: 'restrictedAttributes',

		populate: ['auth', 'isLoggedIn', 'isAdminOrOwned'],

		findOne: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		update: ['auth', 'isLoggedIn', 'isAdminOrOwned', 'restrictedAttributes']
	},

	FileController: {
		findOne: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		update: ['auth', 'isLoggedIn', 'isAdminOrOwned', 'restrictedAttributes'],
		create: ['auth', 'isLoggedIn'],
		destroy: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
	}
};
