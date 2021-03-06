'use strict';
/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */

module.exports = function forbidden (data) {

	// Get access to `req`, `res`, & `sails`
	var req = this.req;
	var res = this.res;
	var sails = req._sails;

	if(!_.isObject(data)) {
		data = {error: data};
	}

	data.status = 403;

	// Set status code
	res.status(403);

	// Log error to console
	if (data !== undefined) {
		sails.log.verbose('Sending 403 ("Forbidden") response: \n',data);
	} else {
		sails.log.verbose('Sending 403 ("Forbidden") response');
	}

	return res.json(data);
};

