'use strict';

const _ = require('lodash');
const State = require('../state');
const {find} = require('./find-func');
const ActionsBuilder = require('./actions-builder');

module.exports = function(suite) {
    this.setCaptureElements = (...selectors) => {
        selectors = _.flatten(selectors);

        if (!selectors.every(_.isString)) {
            throw new TypeError('suite.captureElements accepts only strings or array of strings');
        }

        suite.captureSelectors = selectors;
        return this;
    };

    this.before = (hook) => {
        if (!_.isFunction(hook)) {
            throw new TypeError('before hook must be a function');
        }

        suite.beforeActions = _.clone(suite.beforeActions);
        hook.call(suite.context, ActionsBuilder.create(suite.beforeActions), find);

        return this;
    };

    this.after = (hook) => {
        if (!_.isFunction(hook)) {
            throw new TypeError('after hook must be a function');
        }

        const actions = [];
        hook.call(suite.context, ActionsBuilder.create(actions), find);
        suite.afterActions = actions.concat(suite.afterActions);

        return this;
    };

    this.setUrl = (url) => {
        if (!_.isString(url)) {
            throw new TypeError('URL must be string');
        }
        suite.url = url;
        return this;
    };

    this.setTolerance = (tolerance) => {
        if (!_.isNumber(tolerance)) {
            throw new TypeError('tolerance must be number');
        }
        suite.tolerance = tolerance;
        return this;
    };

    this.capture = (name, opts, cb) => {
        if (!_.isString(name)) {
            throw new TypeError('State name should be string');
        }

        if (!cb) {
            cb = opts;
            opts = null;
        }

        cb = cb || _.noop;
        opts = opts || {};

        if (!_.isFunction(cb)) {
            throw new TypeError('Second argument of suite.capture must be a function');
        }

        if (suite.hasStateNamed(name)) {
            throw new Error(`State "${name}" already exists in suite "${suite.name}". Choose different name`);
        }

        const state = new State(suite, name);
        cb.call(suite.context, ActionsBuilder.create(state.actions), find);

        if ('tolerance' in opts) {
            if (!_.isNumber(opts.tolerance)) {
                throw new TypeError('Tolerance should be number');
            }
            state.tolerance = opts.tolerance;
        }
        suite.addState(state);
        return this;
    };

    this.ignoreElements = (...selectors) => {
        selectors = _.flatten(selectors);

        if (selectors.some(isNotValidSelector)) {
            throw new TypeError('suite.ignoreElements accepts strings, object with property "every" as string or array of them');
        }

        suite.ignoreSelectors = selectors;
        return this;
    };

    const processSkip = (browsers, comment, opts = {}) => {
        browsers = [].concat(browsers);
        if (!isArrayOfStringsAndRegExps(browsers)) {
            throw new TypeError('Browsers must be array of strings or RegExp objects');
        }

        suite.skip({matches: shouldSkip(browsers, opts), comment});
        return this;
    };

    this.skip = (browsers, comment) => {
        if (!browsers) {
            browsers = /.*/;
        }
        return this.skip.in(browsers, comment);
    };

    this.skip.in = (browsers, comment) => processSkip(browsers, comment);

    this.skip.notIn = (browsers, comment) => processSkip(browsers, comment, {negate: true});

    const processOnly = (browsers, opts = {negate: false}) => {
        const argIsUndefined = browsers.length === 0;
        browsers = argIsUndefined ? undefined : _.flatten(browsers);
        if (!isArrayOfStringsAndRegExps(browsers)) {
            throw new TypeError('Browsers must be array of strings or RegExp objects');
        }

        suite.browsers = suite.browsers.filter(shouldSkip(browsers, opts));
        return this;
    };

    this.browsers = (...browsers) => this.only.in(...browsers);

    this.only = {
        in: (...browsers) => processOnly(browsers),
        notIn: (...browsers) => processOnly(browsers, {negate: true})
    };
};

// Check if selector is not a string or not an object with "every" option.
function isNotValidSelector(selector) {
    return !_.isString(selector) && !(_.isObject(selector) && _.isString(selector.every));
}

function isArrayOfStringsAndRegExps(arr) {
    return arr === undefined ? false : _.every(arr, (item) => _.isString(item) || _.isRegExp(item));
}

function mkBrowsersMatcher(browsers, opts = {negate: false}) {
    const {negate} = opts;
    const mkMatcher = (browser) => _.isRegExp(browser) ? browser.test.bind(browser) : _.isEqual.bind(null, browser);

    return browsers.map((browser) => negate ? _.negate(mkMatcher(browser)) : mkMatcher(browser));
}

function shouldSkip(browsers, opts = {negate: false}) {
    const {negate} = opts;
    const fn = negate ? _.every : _.some;
    return (browserId) => fn(mkBrowsersMatcher(browsers, {negate}), (matcher) => matcher(browserId));
}
