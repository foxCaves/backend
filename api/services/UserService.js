var Promise = require("bluebird");

var userPublic = ['name', 'email', 'password'];

module.exports = {
    getCurrent: function getCurrent(req) {
        var userid = req.session.userid;
        if(userid)
            return User.findOneById(userid);
        
        return Promise.resolve(null);
    },
    
    setRestricted: function (input, userid) {
        var data = {};

        userPublic.forEach(function(key) {
            if(input[key])
                data[key] = input[key];
        });

        if(userid) {
            return User.update(userid, data).then(function(user) {
                return user[0];
            });
        } else {
            return User.create(data);
        }
    }
};