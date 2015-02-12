module.exports.connections = {
	localMongo: {
		adapter: 'sails-mongo',
		host: 'localhost',
		port: 27017,
		database: 'foxcaves'
	},
	prodMongo: {
		adapter: 'sails-mongo',
		host: 'localhost',
		port: 27017,
		database: 'foxcaves-prod'
	},
	devMongo: {
		adapter: 'sails-mongo',
		host: 'localhost',
		port: 27017,
		database: 'foxcaves-dev'
	},
};
