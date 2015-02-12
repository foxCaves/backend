module.exports = function(sails) {
	return {
		initialize: function(cb) {
			sails.on('ready', function() {
				console.info('BEGIN drop privileges');
				if(sails.config.foxcaves.gid) {
					console.info('setgid(' + sails.config.foxcaves.gid + ')');
					process.setgid(sails.config.foxcaves.gid);
				}
				if(sails.config.foxcaves.uid) {
					console.info('setuid(' + sails.config.foxcaves.uid + ')');
					process.setuid(sails.config.foxcaves.uid);
				}
				console.info('END drop privileges');
			});
			cb();
		}
	};
};