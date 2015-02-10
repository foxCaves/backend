'use strict';
/**
 * CaptchaService
 *
 * @description :: Service for handling files
 */

var Promise = require('bluebird');
var MongoDB = require('mongodb');
var MongoClient = Promise.promisifyAll(MongoDB.MongoClient);
var util = require('util');

//MongoDB Config
var gridfsMongo = sails.config.connections[sails.config.foxcaves.gridfsMongoConnection];

var uriMongo = util.format(
	'mongodb://%s%s:%d/%s',
	gridfsMongo.username ? (gridfsMongo.password ? gridfsMongo.username + ':' + gridfsMongo.password : gridfsMongo.username) + '@' : '',
	gridfsMongo.host,
	gridfsMongo.port || 27017
);

var GridFS = require('gridfs-stream');

var blobAdapter = require('skipper-gridfs')({  
	uri: uriMongo + '.store_file'
});

function connectMongo() {
	return MongoClient.connectAsync(uriMongo, {native_parser:true});
}

function openFile(fd, mode, bucket, options) {
	options = options || {};
	options.root = bucket;
	options.mode = mode;
	options.filename = fd;

	var _db;

	return connectMongo().then(function(db) {
		_db = db;
		var gridFS = new GridFS(db, MongoDB);
		if(mode.charAt(0) === 'r') {
			return gridFS.createReadStream(options);
		}
		return gridFS.createWriteStream(options);	
	}).then(function(stream) {
		stream.on('close', function() {
			if(_db) {
				_db.close();
				_db = null;
			}
		});
		return stream;
	}).catch(function(err) {
		if(_db) {
			_db.close();
			_db = null;
		}
		throw err;
	});
}

module.exports = {
	makeReceiver: function makeReceiver() {
		return blobAdapter.receive();
	},

	open: function open(file, mode, options) {
		return openFile(file.filePath, mode, 'store_file', options);
	},
	
	openThumbnail: function getThumbnail(file, mode, options) {
		return openFile(file.filePath, mode, 'store_thumbnail', options);
	},

	delete: function deleteFile(file) {
		return connectMongo().then(function(db) {
			return new GridFS(db, MongoDB).then(function(gridFS) {
				if(file.filePath) {
					return gridFS.removeAsync({
						filename: file.filePath,
						root: 'store_file'
					}).then(function() {
						return gridFS;
					});
				} else {
					return gridFS;
				}
			}).then(function(gridFS) {
				if(file.filePath) {
					return gridFS.removeAsync({
						filename: file.filePath,
						root: 'store_thumbnail'
					});
				}
			}).finally(function() {
				if(db) {
					db.close();
				}
			});
		});
	}
};
