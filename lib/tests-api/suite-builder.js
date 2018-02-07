'use strict';
var _ = require('lodash'),
    State = require('../state'),
    find = require('./find-func').find,
    ActionsBuilder = require('./actions-builder');

module.exports = function(suite) {
    this.setCaptureElements = function() {
        var selectors = argumentsToArray(arguments);

        if (selectors.some(notString)) {
            throw new TypeError('suite.captureElements accepts only strings or array of strings');
        }

        suite.captureSelectors = selectors;
        return this;
    };

    this.before = function(hook) {
        if (typeof hook !== 'function') {
            throw new TypeError('before hook must be a function');
        }

        suite.beforeActions = _.clone(suite.beforeActions);
        hook.call(suite.context, ActionsBuilder.create(suite.beforeActions), find);

        return this;
    };

    this.after = function(hook) {
        if (typeof hook !== 'function') {
            throw new TypeError('after hook must be a function');
        }

        var actions = [];
        hook.call(suite.context, ActionsBuilder.create(actions), find);
        suite.afterActions = actions.concat(suite.afterActions);

        return this;
    };

    this.setUrl = function setUrl(url) {
        if (typeof url !== 'string') {
            throw new TypeError('URL must be string');
        }
        suite.url = url;
        return this;
    };

    this.setTolerance = function setTolerance(tolerance) {
        if (typeof tolerance !== 'number') {
            throw new TypeError('tolerance must be number');
        }
        suite.tolerance = tolerance;
        return this;
    };

    const rearrangeCaptureArgs = (name, opts, cb) => {
        if (!cb) {
            cb = opts;
            opts = null;
        }

        cb = cb || _.noop;
        opts = opts || {};

        return {name, opts, cb};
    };

    const processCapture = (name, opts, cb) => {
        if (!_.isString(name)) {
            throw new TypeError('State name should be string');
        }

        if (!_.isFunction(cb)) {
            throw new TypeError('Second argument of suite.capture must be a function');
        }

        if (suite.hasStateNamed(name)) {
            throw new Error('State "' + name + '" already exists in suite "' + suite.name + '". ' +
                'Choose different name');
        }

        const state = new State(suite, name);
        cb.call(suite.context, ActionsBuilder.create(state.actions), find);

        if (_.has(opts, 'tolerance')) {
            if (!_.isNumber(opts.tolerance)) {
                throw new TypeError('Tolerance should be number');
            }
            state.tolerance = opts.tolerance;
        }
        state.viewportOnly = opts.viewportOnly;

        suite.addState(state);
        return this;
    };

    this.capture = (name, opts, cb) => {
        ({name, opts, cb} = rearrangeCaptureArgs(name, opts, cb));
        opts = _.assign({}, opts, {viewportOnly: false});
        return processCapture(name, opts, cb);
    };

    this.captureViewport = (name, opts, cb) => {
        ({name, opts, cb} = rearrangeCaptureArgs(name, opts, cb));
        opts = _.assign({}, opts, {viewportOnly: true});
        return processCapture(name, opts, cb);
    };

    this.ignoreElements = function ignoreElements() {
        var selectors = argumentsToArray(arguments);

        if (selectors.some(isNotValidSelector)) {
            throw new TypeError('suite.ignoreElements accepts strings, object with property "every" as string or array of them');
        }
        suite.ignoreSelectors = selectors;
        return this;
    };

    this.skip = function skip(browser, comment) {
        if (!browser) {
            suite.skip();
        } else if (_.isArray(browser)) {
            browser.forEach(_.bind(this.skip, this, _, comment));
        } else if (_.isString(browser) || _.isRegExp(browser)) {
            suite.skip({matches: createMatcher(browser), comment: comment});
        } else {
            throw new TypeError('suite.skip browser must be string or RegExp object');
        }
        return this;
    };

    this.browsers = function browsers(matchers) {
        matchers = [].concat(matchers);
        if (!isArrayOfStringsAndRegExps(matchers)) {
            throw new TypeError('suite.browsers must be string or RegExp object');
        }

        matchers = matchers.map(createMatcher);
        suite.browsers = suite.browsers.filter(function(browser) {
            return _.some(matchers, function(match) {
                return match(browser);
            });
        });
        return this;
    };
};

function notString(arg) {
    return typeof arg !== 'string';
}

// Check if selector is not a string or not an object with "every" option.
function isNotValidSelector(arg) {
    return !(_.isString(arg) || (_.isObject(arg) && _.isString(arg.every)));
}

function argumentsToArray(args) {
    if (args.length === 1 && Array.isArray(args[0])) {
        return args[0];
    } else {
        return Array.prototype.slice.call(args);
    }
}

function isArrayOfStringsAndRegExps(arr) {
    return _.every(arr, function(item) {
        return _.isString(item) || _.isRegExp(item);
    });
}

function createMatcher(matcher) {
    return _.isRegExp(matcher) ? matcher.test.bind(matcher) : _.isEqual.bind(null, matcher);
}
