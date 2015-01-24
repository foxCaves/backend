/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow logged in users to access
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
    UserService.getCurrentUser(req).then(function(user) {
        if(user)
            return next();
        return res.forbidden('You are not logged in');
    });
};
