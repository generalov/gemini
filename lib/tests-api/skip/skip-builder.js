'use strict';

const Skip = require('./index');

module.exports = class SkipBuilder extends Skip {
    static create(suite) {
        return new SkipBuilder(suite);
    }

    constructor(suite) {
        super(suite);
    }

    in(browsers, comment) {
        return this._process(browsers, comment);
    }

    notIn(browsers, comment) {
        return this._process(browsers, comment, {negate: true});
    }

    _process(browsers, comment, opts = {negate: false}) {
        browsers = [].concat(browsers);
        if (!this._isArrayOfStringsAndRegExps(browsers)) {
            throw new TypeError('Browsers must be array of strings or RegExp objects');
        }

        this._suite.skip({matches: this._shouldSkip(browsers, opts), comment});
        return this;
    }

    buildAPI(context) {
        const skip = (browsers, comment) => {
            if (!browsers) {
                browsers = /.*/;
            }
            this.in(browsers, comment);
            return context;
        };

        skip.in = (browsers, comment) => {
            this.in(browsers, comment);
            return context;
        };

        skip.notIn = (browsers, comment) => {
            this.notIn(browsers, comment);
            return context;
        };

        return {skip};
    }
};
