/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcrypt');
var async = require('async');

module.exports = {
    attributes: {
        name: {
            type: "string",
            unique: true,
            required: true
        },
        
        email: {
            type: "email",
            unique: true,
            required: true
        },
        
        password: {
            type: "string",
            required: true
        },
        
        checkPassword: function checkPassword(password) {
            return this.password === hashPassword(password);
        }
    },
    
    beforeCreate: function (attrs, next) {
        return this.filterUpdate(attrs, next);
    },

    beforeUpdate: function (attrs, next) {
        return this.filterUpdate(attrs, next);
    },
    
    filterUpdate: function (attrs, next) {
         async.waterfall([
            async.apply(bcrypt.genSalt, 10),
            async.apply(bcrypt.hash, attrs.password)
        ], function(err, hash, callback) {
            if (err)
                return next(err);
            attrs.password = hash;
            next();
        });       
    }
};

