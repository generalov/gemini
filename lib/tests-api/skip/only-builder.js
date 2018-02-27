'use strict';

const Skip = require('./index');
const _ = require('lodash');

module.exports = class OnlyBuilder extends Skip {
    static create(suite) {
        return new OnlyBuilder(suite);
    }

    constructor(suite) {
        super(suite);
    }

    in(...browsers) {
        return this._process(browsers);
    }

    notIn(...browsers) {
        return this._process(browsers, {negate: true});
    }

    _process(browsers, opts = {negate: false}) {
        browsers = _.flatten(browsers);
        if (!this._isArrayOfStringsAndRegExps(browsers)) {
            throw new TypeError('Browsers must be an array with strings and RegExp objects');
        }

        this._suite.browsers = this._suite.browsers.filter(this._shouldSkip(browsers, opts));
        return this;
    }

    buildAPI(context) {
        const only = {
            in: (...browsers) => {
                this.in(...browsers);
                return context;
            },
            notIn: (...browsers) => {
                this.notIn(...browsers);
                return context;
            }
        };
        const browsers = (...browsers) => {
            const isEmptyArray = _.isEqual(browsers, [[]]);

            return isEmptyArray
                ? only.notIn(/.*/)
                : only.in(...browsers);
        };

        return {only, browsers};
    }
};
