'use strict';

const _ = require('lodash');
const State = require('../state');
const {find} = require('./find-func');
const ActionsBuilder = require('./actions-builder');

module.exports = function(suite) {
    this.setCaptureElements = (...args) => {
        const selectors = _.flatten(args);

        if (!_.every(selectors, _.isString)) {
            throw new TypeError('suite.captureElements accepts only strings or array of strings');
        }

        suite.captureSelectors = selectors;
        return this;
    };

    this.before = (hook) => {
        if (typeof hook !== 'function') {
            throw new TypeError('before hook must be a function');
        }

        suite.beforeActions = _.clone(suite.beforeActions);
        hook.call(suite.context, ActionsBuilder.create(suite.beforeActions), find);

        return this;
    };

    this.after = (hook) => {
        if (typeof hook !== 'function') {
            throw new TypeError('after hook must be a function');
        }

        const actions = [];
        hook.call(suite.context, ActionsBuilder.create(actions), find);
        suite.afterActions = actions.concat(suite.afterActions);

        return this;
    };

    this.setUrl = (url) => {
        if (typeof url !== 'string') {
            throw new TypeError('URL must be string');
        }
        suite.url = url;
        return this;
    };

    this.setTolerance = (tolerance) => {
        if (typeof tolerance !== 'number') {
            throw new TypeError('tolerance must be number');
        }
        suite.tolerance = tolerance;
        return this;
    };

    this.capture = (name, opts, cb) => {
        if (typeof name !== 'string') {
            throw new TypeError('State name should be string');
        }

        if (!cb) {
            cb = opts;
            opts = null;
        }

        cb = cb || _.noop;
        opts = opts || {};

        if (typeof cb !== 'function') {
            throw new TypeError('Second argument of suite.capture must be a function');
        }

        if (suite.hasStateNamed(name)) {
            throw new Error('State "' + name + '" already exists in suite "' + suite.name + '". ' +
                'Choose different name');
        }

        const state = new State(suite, name);
        cb.call(suite.context, ActionsBuilder.create(state.actions), find);

        if ('tolerance' in opts) {
            if (typeof opts.tolerance !== 'number') {
                throw new TypeError('Tolerance should be number');
            }
            state.tolerance = opts.tolerance;
        }
        suite.addState(state);
        return this;
    };

    this.ignoreElements = (...args) => {
        const selectors = _.flatten(args);

        if (selectors.some(isNotValidSelector)) {
            throw new TypeError('suite.ignoreElements accepts strings, object with property "every" as string or array of them');
        }
        suite.ignoreSelectors = selectors;
        return this;
    };

    const processSkipped = (browser, comment, opts = {}) => {
        if (!isArrayOfStringsAndRegExps(_.isArray(browser) ? browser : [browser])) {
            throw new TypeError('Browsers must be string or RegExp objects');
        }

        suite.skip({matches: shouldSkip(browser, opts), comment});
    };

    this.skip = (browser, comment) => {
        if (!browser) {
            suite.skip();
        } else {
            processSkipped(browser, comment);
        }
        return this;
    };

    this.skip.in = (browser, comment) => {
        if (browser) {
            this.skip(browser, comment);
        }
        return this;
    };

    this.skip.notIn = (browser, comment) => {
        if (browser) {
            processSkipped(browser, comment, {negate: true});
        }
        return this;
    };

    const processBrowsers = (browsers, opts = {negate: false}) => {
        const argIsUndefined = browsers.length === 0;
        browsers = _.flatten(browsers);
        if (argIsUndefined || !isArrayOfStringsAndRegExps(browsers)) {
            throw new TypeError('Browsers must be string or RegExp objects');
        }

        suite.browsers = suite.browsers.filter(shouldSkip(browsers, opts));
        return this;
    };

    this.browsers = (...browsers) => processBrowsers(browsers);

    this.only = {
        in: (...browsers) => this.browsers(...browsers),
        notIn: (...browsers) => processBrowsers(browsers, {negate: true})
    };
};

// Check if selector is not a string or not an object with "every" option.
function isNotValidSelector(selector) {
    return !(_.isString(selector) || (_.isObject(selector) && _.isString(selector.every)));
}

function isArrayOfStringsAndRegExps(arr) {
    return _.every(arr, (item) => _.isString(item) || _.isRegExp(item));
}

function mkBrowserMatcher(browsers, {negate} = {negate: false}) {
    const mkMatcher = (browser) => _.isRegExp(browser) ? browser.test.bind(browser) : _.isEqual.bind(null, browser);

    return [].concat(browsers)
        .map((bro) => negate ? _.negate(mkMatcher(bro)) : mkMatcher(bro));
}

function shouldSkip(browsers, {negate} = {negate: false}) {
    const fn = negate ? _.every : _.some;
    return (browserId) => fn(mkBrowserMatcher(browsers, {negate}), (m) => m(browserId));
}
