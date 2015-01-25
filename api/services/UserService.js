var Promise = require("bluebird");

module.exports = {
	getCurrent: function getCurrent(req) {
		var userid = req.session.userid;
		if(userid)
			return User.findOneById(userid);
		
		return Promise.resolve(null);
	}
};