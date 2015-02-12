module.exports = function(sails) {
	return {
		initialize: function(cb) {
			sails.on('ready', function() {
				console.info('BEGIN drop privileges');
				if(sails.config.foxcaves.security.chroot) {
					console.info('chroot,setuid,setgid');
					require('chroot')(process.cwd(), sails.config.foxcaves.security.uid, sails.config.foxcaves.security.gid);
				} else {
					if(sails.config.foxcaves.security.gid) {
						console.info('setgid');
						process.setgid(sails.config.foxcaves.security.gid);
					}
					if(sails.config.foxcaves.security.uid) {
						console.info('setuid');
						process.setuid(sails.config.foxcaves.security.uid);
					}
				}
				console.info('END drop privileges');
			});
			cb();
		}
	};
};