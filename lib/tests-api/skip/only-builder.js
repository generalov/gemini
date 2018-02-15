'use strict';

const Skip = require('./index');
const _ = require('lodash');

module.exports = class OnlyBuilder extends Skip {
    constructor(suite) {
        super(suite);
    }

    in(browsers) {
        return this._process(browsers);
    }

    notIn(browsers) {
        return this._process(browsers, {negate: true});
    }

    _process(browsers, opts = {negate: false}) {
        browsers = [].concat(browsers);
        if (!this._isArrayOfStringsAndRegExps(browsers)) {
            throw new TypeError('Browsers must be array of strings or RegExp objects');
        }

        this._suite.browsers = this._suite.browsers.filter(this._shouldSkip(browsers, opts));
        return this;
    }

    buildAPI(context) {
        const only = {
            in: (...browsers) => {
                this.in(fixArgumentsAfterSpread(browsers));
                return context;
            },
            notIn: (...browsers) => {
                this.notIn(fixArgumentsAfterSpread(browsers));
                return context;
            }
        };
        const browsers = (...browsers) => only.in(...browsers);

        return {only, browsers};
    }
};

function fixArgumentsAfterSpread(args) {
    const argsIsUndefined = args.length === 0;
    return argsIsUndefined ? undefined : _.flatten(args);
}
