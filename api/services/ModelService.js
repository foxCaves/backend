function getFilteredParams(Model, input) {
	var data = {};

	Model.publicWritable.forEach(function(key) {
		if(input[key])
			data[key] = input[key];
	});

	return data;		
}

module.exports = {
	setRestricted: function setRestricted(Model, input, id) {
		var data = getFilteredParams(Model, input);

		if(id) {
			return Model.update(id, data).then(function(user) {
				return user[0];
			});
		} else {
			return Model.create(data);
		}
	},

	getFilteredParams: getFilteredParams
};