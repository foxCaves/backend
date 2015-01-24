/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow admins to access
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
    UserService.getCurrentUser(req).then(function(user) {
        if(user && user.isAdmin())
            return next();
        return res.forbidden('You are not admin');
    });
};
