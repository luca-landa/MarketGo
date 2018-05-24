"use strict";

function setup() {
    // nodejs backward compatibility setup
    // from https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array

    Array.prototype.includes = function(searchElement) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.includes called on null or undefined');
        }

        if(typeof searchElement === 'object')
            searchElement = JSON.stringify(searchElement);

        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1], 10) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if(typeof currentElement === 'object') {
                let currentElementJSON = JSON.stringify(currentElement);
                if (searchElement === currentElementJSON) {
                    return true;
                }
            }
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };

    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function (predicate) {
                'use strict';
                if (this == null) {
                    throw new TypeError('Array.prototype.find called on null or undefined');
                }
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                var list = Object(this);
                var length = list.length >>> 0;
                var thisArg = arguments[1];

                for (var i = 0; i !== length; i++) {
                    if (predicate.call(thisArg, this[i], i, list)) {
                        return this[i];
                    }
                }
                return undefined;
            }
        });
    }

    Array.prototype.findIndexOf = (element) => {
        if(!this.includes(element)) {
            return -1;
        }

        if(typeof element === 'object') {
            element = JSON.stringify(element);
        }

        var list = Object(this);
        for(var i = 0; i < list.length; i++) {
            var arrayEl = list[i];
            if(typeof arrayEl === 'object') {
                arrayEl = JSON.stringify(arrayEl);
            }

            if(element === arrayEl) {
                return i;
            }
        }
        return -1;
    };

    if (!Array.prototype.delete) {
        Array.prototype.delete = (element) => {
            if (!this.includes(element)) {
                return null;
            } else {
                return this.splice(this.findIndexOf(element));
            }
        }
    }

    Object.prototype.includes = Array.prototype.includes;
    Object.prototype.find = Array.prototype.find;
    Object.prototype.findIndexOf = Array.prototype.findIndexOf;
    Object.prototype.delete = Array.prototype.delete;
}

exports.setup = setup;