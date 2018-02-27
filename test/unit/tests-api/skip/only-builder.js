'use strict';

const Suite = require('lib/suite');
const OnlyBuilder = require('lib/tests-api/skip/only-builder');

describe('tests-api/skip/only-builder', () => {
    const sandbox = sinon.sandbox.create();
    let rootSuite;
    let suite;
    let onlyBuilder;

    beforeEach(() => {
        rootSuite = Suite.create('');
        suite = Suite.create('some-suite', rootSuite);
        onlyBuilder = new OnlyBuilder(suite);
    });

    afterEach(() => {
        sandbox.restore();
    });

    const errorMessage = 'Browsers must be an array with strings and RegExp objects';

    const testShouldThrow = (method) => {
        return describe('thould throw', () => {
            it('without an argument', () => {
                assert.throws(() => {
                    onlyBuilder[method]();
                }, TypeError, errorMessage);
            });

            it('if argument is not a string or RegExp', () => {
                assert.throws(() => {
                    onlyBuilder[method](0);
                }, TypeError, errorMessage);
            });

            it('if argument is an array of non-strings or non-RegExps', () => {
                assert.throws(() => {
                    onlyBuilder[method]([false]);
                }, TypeError, errorMessage);
            });

            it('if argument is an object', () => {
                assert.throws(() => {
                    onlyBuilder[method]({browserName: 'name', version: '123', id: 'browser'});
                }, TypeError, errorMessage);
            });

            it('if argument is an empty array', () => {
                assert.throws(() => {
                    onlyBuilder[method]([]);
                }, TypeError, errorMessage);
            });
        });
    };

    describe('in', () => {
        testShouldThrow('in');

        describe('should filter suite browsers by', () => {
            it('a string', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

                onlyBuilder.in('chrome');

                assert.deepEqual(suite.browsers, ['chrome']);
            });

            it('a RegExp', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

                onlyBuilder.in(/ie.+/);

                assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
            });

            it('an array of strings', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

                onlyBuilder.in(['chrome', 'ie8']);

                assert.deepEqual(suite.browsers, ['ie8', 'chrome']);
            });

            it('an array of RegExps', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

                onlyBuilder.in([/ie.+/]);

                assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
            });

            it('an array of strings and RegExps', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

                onlyBuilder.in([/ie.+/, 'chrome']);

                assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
            });

            it('strings and RegExps', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

                onlyBuilder.in(/ie.+/, 'chrome');

                assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
            });
        });

        it('should not set a browser for a suite if it is not specified in a root one', () => {
            rootSuite.browsers = ['opera'];

            onlyBuilder.in('chrome');

            assert.deepEqual(suite.browsers, []);
        });

        it('should be chainable', () => {
            assert.equal(onlyBuilder.in('bro'), onlyBuilder);
        });

        it('should filter browsers in all children suites', () => {
            const firstChild = Suite.create('firstChild', suite);
            const secondChild = Suite.create('secondChild', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.in([/ie.+/, 'chrome']);
            new OnlyBuilder(firstChild).in(/ie.+/);
            new OnlyBuilder(secondChild).in('chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
            assert.deepEqual(firstChild.browsers, ['ie8', 'ie9']);
            assert.deepEqual(secondChild.browsers, ['chrome']);
        });

        it('should pass filtered browsers from a parent suite to a child one', () => {
            const childSuite = Suite.create('child', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.in('chrome');

            assert.deepEqual(childSuite.browsers, ['chrome']);
        });
    });

    describe('notIn', () => {
        testShouldThrow('notIn');

        describe('should filter suite browsers by', () => {
            it('a string', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

                onlyBuilder.notIn('chrome');

                assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
            });

            it('a RegExp', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

                onlyBuilder.notIn(/ie.+/);

                assert.deepEqual(suite.browsers, ['chrome']);
            });

            it('an array of strings', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

                onlyBuilder.notIn(['chrome', 'ie8']);

                assert.deepEqual(suite.browsers, ['ie9']);
            });

            it('an array of RegExps', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

                onlyBuilder.notIn([/ie.+/]);

                assert.deepEqual(suite.browsers, ['chrome']);
            });

            it('an array of strings and RegExps', () => {
                rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

                onlyBuilder.notIn([/ie.+/, 'chrome']);

                assert.deepEqual(suite.browsers, ['opera']);
            });
        });

        it('should not set a browser for a suite if all browsers are excluded', () => {
            rootSuite.browsers = ['opera'];

            onlyBuilder.notIn('opera');

            assert.deepEqual(suite.browsers, []);
        });

        it('should be chainable', () => {
            assert.equal(onlyBuilder.notIn('bro'), onlyBuilder);
        });

        it('should filter browsers in all children suites', () => {
            const firstChild = Suite.create('firstChild', suite);
            const secondChild = Suite.create('secondChild', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.notIn(['opera']);
            new OnlyBuilder(firstChild).notIn(/ie.+/);
            new OnlyBuilder(secondChild).notIn('chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
            assert.deepEqual(firstChild.browsers, ['chrome']);
            assert.deepEqual(secondChild.browsers, ['ie8', 'ie9']);
        });

        it('should pass filtered browsers from a parent suite to a child one', () => {
            const childSuite = Suite.create('child', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.notIn('chrome');

            assert.deepEqual(childSuite.browsers, ['ie8', 'ie9', 'opera']);
        });
    });

    describe('buildAPI', () => {
        let api;

        beforeEach(() => {
            api = onlyBuilder.buildAPI(suite);
        });

        it('should return API methods', () => {
            assert.isObject(api);
            assert.isFunction(api.browsers);
            assert.isFunction(api.only.in);
            assert.isFunction(api.only.notIn);
        });

        describe('only.in', () => {
            it('should call OnlyBuilder\'s .in method', () => {
                sandbox.spy(onlyBuilder, 'in');

                api.only.in('browser1', 'browser2');

                assert.calledWith(onlyBuilder.in, 'browser1', 'browser2');
            });

            it('should return suite', () => {
                const returnValue = api.only.in('browser1', 'browser2');

                assert.equal(returnValue, suite);
            });
        });

        describe('only.notIn', () => {
            it('should call OnlyBuilder\'s .notIn method', () => {
                sandbox.spy(onlyBuilder, 'notIn');

                api.only.notIn(['browser1', 'browser2']);

                assert.calledWith(onlyBuilder.notIn, ['browser1', 'browser2']);
            });

            it('should return suite', () => {
                const returnValue = api.only.notIn('browser1', 'browser2');

                assert.equal(returnValue, suite);
            });
        });

        describe('browsers', () => {
            beforeEach(() => {
                sandbox.spy(onlyBuilder, 'in');
                sandbox.spy(onlyBuilder, 'notIn');
            });

            it('should call OnlyBuilder\'s .in method', () => {
                api.browsers('browser1', 'browser2');

                assert.calledWith(onlyBuilder.in, 'browser1', 'browser2');
            });

            it('should return suite', () => {
                const returnValue = api.browsers('browser1', 'browser2');

                assert.equal(returnValue, suite);
            });

            it('should skip all browsers if argument is an empty array', () => {
                api.browsers([]);

                assert.calledWith(onlyBuilder.notIn, /.*/);
            });
        });
    });
});
