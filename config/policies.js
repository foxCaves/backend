'use strict';

module.exports.policies = {

	'*': false,

	CsrfTokenController: true,
  
	UserController: {
		login: true,
		logout: true,
		
		create: 'restrictedAttributes',

		getMe: ['auth', 'isLoggedIn'],
		updateMe: ['auth', 'isLoggedIn', 'restrictedAttributes']
	},

	FileController: {
		findOne: ['auth', 'isLoggedIn', 'isAdminOrOwned', 'restrictedAttributes'],

		find: ['auth', 'isLoggedIn', 'restrictedAttributes'],

		create: ['auth', 'isLoggedIn', 'restrictedAttributes'],
		destroy: ['auth', 'isLoggedIn', 'isAdminOrOwned'],

		contents: true,
		thumbnail: true
	}
};
