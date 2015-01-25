module.exports.policies = {

	'*': ['auth', 'isAdmin'],
  
	UserController: {
		login: true,
		logout: true,
		
		register: true,
		
		me: ['auth', 'isLoggedIn'],
		setMe: ['auth', 'isLoggedIn']
	},

	FileController: {
		'create': ['auth', 'isLoggedIn'],
		'find': ['auth', 'isLoggedIn'],

		'findOne': ['auth', 'isAdminOrOwned'],
		//'update': ['auth', 'isAdminOrOwned']
	}
};
