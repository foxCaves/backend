var Promise = require("bluebird");

module.exports = {
    getCurrentUser: function getCurrentUser(req, cb) {
        var userid = req.session.userid;
        if(userid)
            return User.findOneById(userid, cb);
        
        if(cb)
            cb(null, null);
        else
            return new Promise(function(resolve) { resolve(null); });
    }
};