/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Promise = require('bluebird')
var bcrypt = Promise.promisifyAll(require('bcrypt'));

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
        
        admin: {
            type: "boolean",
            default: false
        },
        
        password: {
            type: "string",
            required: true
        },
                   
        isAdmin: function() {
            return this.admin;
        }
    },
    
    beforeCreate: function (attrs, next) {
        return this.filterUpdate(attrs, next);
    },

    beforeUpdate: function (attrs, next) {
        return this.filterUpdate(attrs, next);
    },
    
    filterUpdate: function (attrs, next) {
        if(attrs.password) {
            bcrypt.genSaltAsync(10).then(function(salt) {
                return bcrypt.hashAsync(attrs.password, salt);
            }).then(function(hash) {
                attrs.password = hash;
                next();
            }, next);
        } else {
            next();
        }
    }
};

