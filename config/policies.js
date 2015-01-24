module.exports.policies = {

    '*': 'isAdmin',
  
    UserController: {
        login: true,
        logout: true,
        
        register: true,
        
        me: 'isLoggedIn',
        setMe: 'isLoggedIn'
    }
};
