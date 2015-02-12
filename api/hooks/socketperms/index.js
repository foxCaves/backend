'use strict';

module.exports = function (sails) {
	return {
		initialize: function (cb) {
			sails.on('hook:http:listening', function () {
				if(sails.config.chownSocket) {
					var fs = require('fs');
					var socket = sails.config.port;
					var stats = fs.statSync(socket);
					fs.chownSync(socket, sails.config.chownSocket.uid || stats.uid, sails.config.chownSocket.gid || stats.gid);
					fs.chmodSync(socket, sails.config.chownSocket.chmod);
				}
			});
			cb();
		}
	};
 };