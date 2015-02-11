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
		
		create: ['auth', 'isGuest', 'captcha', 'restrictedAttributes'],

		get: 'auth',
		update: ['auth', 'isLoggedIn', 'restrictedAttributes'],

		activate: ['auth', 'isLoggedIn'],
		resendActivation: ['auth', 'isLoggedIn'],

		sendPasswordReset: ['auth', 'isGuest', 'captcha'],
		resetPassword: ['auth', 'isGuest']
	},

	FileController: {
		findOne: ['auth', 'isLoggedIn', 'isActive', 'isOwned', 'restrictedAttributes'],
		find: ['auth', 'isLoggedIn', 'isActive', 'restrictedAttributes'],

		create: ['auth', 'isLoggedIn', 'isActive', 'restrictedAttributes'],
		destroy: ['auth', 'isLoggedIn', 'isActive', 'isOwned'],

		contents: true,
		thumbnail: true,
		findOnePublic: true
	},

	TestController: {
		captcha: 'captcha'
	}
};
