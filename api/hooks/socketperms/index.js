'use strict';

module.exports = function (sails) {
	return {
		initialize: function (cb) {
			sails.on('hook:http:listening', function () {
				if(sails.config.chownSocket) {
					var fs = require('fs');
					var socket = sails.config.port;
					fs.chmodSync(socket, sails.config.chownSocket.chmod);
				}
			});
			cb();
		}
	};
 };