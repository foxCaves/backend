module.exports.policies = {

	'*': ['auth', 'isLoggedIn', 'isAdmin'],
  
	UserController: {
		login: true,
		logout: true,
		
		create: 'restrictedAttributes',

		findOne: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		update: ['auth', 'isLoggedIn', 'isAdminOrOwned', 'restrictedAttributes']
	},

	FileController: {
		create: ['auth', 'isLoggedIn'],
		//find: ['auth', 'isLoggedIn'],

		destroy: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		findOne: ['auth', 'isLoggedIn', 'isAdminOrOwned'],
		//update: ['auth', 'isAdminOrOwned', 'restrictedAttributes']
	}
};
