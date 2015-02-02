'use strict';

function getFilteredParams(Model, input) {
	if(!Model.restrictedAttributes)
		return input;

	var data = input;

	Model.restrictedAttributes().forEach(function(key) {
		delete data[key];
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