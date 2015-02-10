'use strict';

module.exports.policies = {

	'*': false,

	ConfigController: {
		csrfToken: true,
		captcha: true
	},
  
	UserController: {
		login: true,
		logout: true,
		
		create: ['captcha', 'restrictedAttributes'],

		get: 'auth',
		update: ['auth', 'isLoggedIn', 'restrictedAttributes'],

		activate: 'auth'
	},

	FileController: {
		findOne: ['auth', 'isLoggedIn', 'isAdminOrOwned', 'restrictedAttributes'],
		find: ['auth', 'isLoggedIn', 'restrictedAttributes'],

		create: ['auth', 'isLoggedIn', 'restrictedAttributes'],
		destroy: ['auth', 'isLoggedIn', 'isAdminOrOwned'],

		contents: true,
		thumbnail: true,
		findOnePublic: true
	},

	TestController: {
		captcha: 'captcha'
	}
};
