'use strict';

const SuiteBuilder = require('lib/tests-api/suite-builder');
const Suite = require('lib/suite');
const ActionsBuilder = require('lib/tests-api/actions-builder');
const {find} = require('lib/tests-api/find-func');

describe('tests-api/suite-builder', () => {
    const sandbox = sinon.sandbox.create();
    let suite;
    let suiteBuilder;

    beforeEach(() => {
        suite = Suite.create('');
        suiteBuilder = new SuiteBuilder(suite);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('setUrl', () => {
        it('should throw if argument is not a string', () => {
            assert.throws(() => {
                suiteBuilder.setUrl({not: 'a string'});
            }, TypeError);
        });

        it('should set url property', () => {
            suiteBuilder.setUrl('http://example.com');
            assert.equal(suite.url, 'http://example.com');
        });

        it('should be chainable', () => {
            assert.equal(
                suiteBuilder.setUrl(''),
                suiteBuilder
            );
        });
    });

    describe('setTolerance', () => {
        it('should throw if argument is not a string', () => {
            assert.throws(() => {
                suiteBuilder.setTolerance('so much');
            }, TypeError);
        });

        it('should set tolerance passed as number', () => {
            suiteBuilder.setTolerance(25);
            assert.equal(suite.tolerance, 25);
        });

        it('should be chainable', () => {
            assert.equal(
                suiteBuilder.setTolerance(0),
                suiteBuilder
            );
        });
    });

    describe('setCaptureElements', () => {
        it('should throw if selector is not a string', () => {
            assert.throws(() => {
                suiteBuilder.setCaptureElements({everything: true});
            }, TypeError);
        });

        it('should throw if selector in array is not a string', () => {
            assert.throws(() => {
                suiteBuilder.setCaptureElements([{everything: true}, '.selector']);
            }, TypeError);
        });

        it('should set captureSelectors property', () => {
            suiteBuilder.setCaptureElements('.selector');

            assert.deepEqual(suite.captureSelectors, ['.selector']);
        });

        it('should accept multiple arguments', () => {
            suiteBuilder.setCaptureElements('.selector1', '.selector2');
            assert.deepEqual(suite.captureSelectors, ['.selector1', '.selector2']);
        });

        it('should accept array', () => {
            suiteBuilder.setCaptureElements(['.selector1', '.selector2']);

            assert.deepEqual(suite.captureSelectors, ['.selector1', '.selector2']);
        });
    });

    describe('ignoreElements', () => {
        it('should throw if selector is a null', () => {
            assert.throws(() => {
                suiteBuilder.ignoreElements(null);
            }, TypeError);
        });

        it('should throw if selector is object without property "every"', () => {
            assert.throws(() => {
                suiteBuilder.ignoreElements({});
            }, TypeError);
        });

        it('should throw if selector is an object with property "every" that not a string', () => {
            assert.throws(() => {
                suiteBuilder.ignoreElements({every: null});
            }, TypeError);
        });

        it('should throw if one of selectors in array has wrong type', () => {
            assert.throws(() => {
                suiteBuilder.ignoreElements([{every: true}, '.selector']);
            }, TypeError);
        });

        it('should set ignoreSelectors property as string', () => {
            suiteBuilder.ignoreElements('.selector');

            assert.deepEqual(suite.ignoreSelectors, ['.selector']);
        });

        it('should set ignoreSelectors property as object with property "every"', () => {
            suiteBuilder.ignoreElements({every: '.selector'});

            assert.deepEqual(suite.ignoreSelectors, [{every: '.selector'}]);
        });

        it('should accept multiple arguments', () => {
            suiteBuilder.ignoreElements('.selector1', {every: '.selector2'});

            assert.deepEqual(suite.ignoreSelectors, ['.selector1', {every: '.selector2'}]);
        });

        it('should accept array', () => {
            suiteBuilder.ignoreElements(['.selector1', {every: '.selector2'}]);

            assert.deepEqual(suite.ignoreSelectors, ['.selector1', {every: '.selector2'}]);
        });
    });

    describe('before', () => {
        beforeEach(() => {
            sandbox.stub(ActionsBuilder, 'create').returns(new ActionsBuilder());
        });

        it('should call before hook with actions builder and find', () => {
            const hook = sinon.stub();

            suiteBuilder.before(hook);

            assert.calledOnce(hook);
            assert.calledWith(hook, sinon.match.instanceOf(ActionsBuilder), find);
        });

        it('should call before hook and set beforeActions property', () => {
            ActionsBuilder.create.returnsArg(0);

            suiteBuilder.before((actions) => {
                actions.push(1, 2, 3);
            });

            assert.deepEqual([1, 2, 3], suite.beforeActions);
        });

        it('should call before hook with suite context', () => {
            const hook = sinon.stub();

            suiteBuilder.before(hook);

            assert.equal(
                hook.thisValues[0],
                suite.context
            );
        });

        it('should prepend suite beforeActions with parent beforeActions', () => {
            const parent = Suite.create('parent');
            const suite = Suite.create('suite', parent);

            parent.beforeActions = [1, 2, 3];
            ActionsBuilder.create.returnsArg(0);
            new SuiteBuilder(suite).before((actions) => {
                actions.push(4, 5);
            });

            assert.deepEqual([1, 2, 3, 4, 5], suite.beforeActions);
        });

        it('should not affect parent beforeActions property', () => {
            const parent = Suite.create('parent');
            const suite = Suite.create('suite', parent);

            parent.beforeActions = [1, 2, 3];
            ActionsBuilder.create.returnsArg(0);
            new SuiteBuilder(suite).before((actions) => {
                actions.push(4, 5);
            });

            assert.deepEqual([1, 2, 3], parent.beforeActions);
        });
    });

    describe('after', () => {
        beforeEach(() => {
            sandbox.stub(ActionsBuilder, 'create').returns(new ActionsBuilder());
        });

        it('should call after hook with actions builder and find', () => {
            const hook = sinon.stub();

            suiteBuilder.after(hook);

            assert.calledOnce(hook);
            assert.calledWith(hook, sinon.match.instanceOf(ActionsBuilder), find);
        });

        it('should call after hook and set afterActions property', () => {
            ActionsBuilder.create.returnsArg(0);

            suiteBuilder.after((actions) => {
                actions.push(1, 2, 3);
            });

            assert.deepEqual([1, 2, 3], suite.afterActions);
        });

        it('should call after hook with suite context', () => {
            const hook = sinon.stub();

            suiteBuilder.after(hook);

            assert.equal(
                hook.thisValues[0],
                suite.context
            );
        });

        it('should append parent afterActions to suite afterActions', () => {
            const parent = Suite.create('parent');
            const suite = Suite.create('suite', parent);

            parent.afterActions = [4, 5];
            ActionsBuilder.create.returnsArg(0);
            new SuiteBuilder(suite).after((actions) => {
                actions.push(1, 2, 3);
            });

            assert.deepEqual([1, 2, 3, 4, 5], suite.afterActions);
        });

        it('should not affect parent afterActions property', () => {
            const parent = Suite.create('parent');
            const suite = Suite.create('suite', parent);

            parent.afterActions = [4, 5];
            ActionsBuilder.create.returnsArg(0);
            new SuiteBuilder(suite).after((actions) => {
                actions.push(1, 2, 3);
            });

            assert.deepEqual([4, 5], parent.afterActions);
        });
    });

    describe('capture', () => {
        beforeEach(() => {
            suiteBuilder
                .setUrl('/path')
                .setCaptureElements('.element');
        });

        it('should throw if first argument is not passed', () => {
            assert.throws(() => {
                suiteBuilder.capture({not: 'a string'});
            }, TypeError);
        });

        it('should throw if second argument is not a function', () => {
            assert.throws(() => {
                suiteBuilder.capture('state', 'make me a sandwich');
            }, TypeError);
        });

        it('should not throw if second argument is absent', () => {
            assert.doesNotThrow(() => {
                suiteBuilder.capture('state');
            });
        });

        it('should create named state', () => {
            suiteBuilder.capture('state');
            assert.equal(suite.states[0].name, 'state');
        });

        it('should throw if state with such name already exists', () => {
            assert.throws(() => {
                suiteBuilder.capture('state');
                suiteBuilder.capture('state');
            });
        });

        it('should allow to have multiple states of different names', () => {
            suiteBuilder
                .capture('state 1')
                .capture('state 2');

            assert.equal(suite.states[0].name, 'state 1');
            assert.equal(suite.states[1].name, 'state 2');
        });

        it('should make new state reference the suite', () => {
            suiteBuilder.capture('state');
            assert.equal(suite.states[0].suite, suite);
        });

        it('should call passed callback with actions builder and find', () => {
            const cb = sinon.stub();

            suiteBuilder.capture('state', cb);

            assert.calledOnce(cb);
            assert.calledWith(cb, sinon.match.instanceOf(ActionsBuilder), find);
        });

        it('should call passed callback with suite context', () => {
            const cb = sinon.stub();

            suiteBuilder.capture('state', cb);

            assert.equal(
                cb.thisValues[0],
                suite.context
            );
        });

        it('should set `actions` property', () => {
            sandbox.stub(ActionsBuilder, 'create').returnsArg(0);

            suiteBuilder.capture('state', (actions) => {
                actions.push(1, 2, 3);
            });

            assert.deepEqual([1, 2, 3], suite.states[0].actions);
        });

        it('should allow to set tolerance', () => {
            suiteBuilder.capture('state', {tolerance: 25}, () => {
            });
            assert.equal(suite.states[0].tolerance, 25);
        });

        it('should throw if tolerance is not a number', () => {
            assert.throws(() => {
                suiteBuilder.capture('state', {tolerance: 'so much'}, () => {
                });
            }, TypeError);
        });

        it('should be chainable', () => {
            assert.equal(suiteBuilder.capture('state'), suiteBuilder);
        });
    });

    describe('skip.in', () => {
        const errorMessage = 'Browsers must be string or RegExp objects';

        it('should throw if argument is not a string nor RegExp', () => {
            assert.throws(() => {
                suiteBuilder.skip.in(0);
            }, TypeError, errorMessage);
        });

        it('should throw if argument is array with non-string or non-RegExp', () => {
            assert.throws(() => {
                suiteBuilder.skip.in([false]);
            }, TypeError, errorMessage);
        });

        it('should throw if argument is an object', () => {
            assert.throws(() => {
                suiteBuilder.skip.in({browserName: 'name', version: '123', id: 'browser'});
            }, TypeError, errorMessage);
        });

        it('should throw if no argument', () => {
            assert.throws(() => {
                suiteBuilder.skip.in();
            }, TypeError, errorMessage);
        });

        it('should accept skipped browser string id', () => {
            suiteBuilder.skip.in('opera');

            assert.equal(suite.skipped.length, 1);
            assert.isTrue(suite.skipped[0].matches('opera'));
            assert.isFalse(suite.skipped[0].matches('firefox'));
        });

        it('should accept skipped browser RegExp', () => {
            suiteBuilder.skip.in(/ie1.*/);

            assert.isTrue(suite.skipped[0].matches('ie11'));
            assert.isFalse(suite.skipped[0].matches('ie8'));
        });

        it('should accept array of string ids and RegExp\'s', () => {
            suiteBuilder.skip.in([
                'ie11',
                /firefox/
            ]);

            assert.isTrue(suite.skipped[0].matches('ie11'));
            assert.isTrue(suite.skipped[0].matches('firefox33'));
            assert.isFalse(suite.skipped[0].matches('chrome'));
        });

        it('should skip nothing if argument is an empty array', () => {
            suiteBuilder.skip.in([]);

            assert.isFalse(suite.shouldSkip('any_borwser'));
        });

        it('should accept comments', () => {
            suiteBuilder.skip.in('chrome', 'comment');

            assert.isTrue(suite.shouldSkip('chrome'));
            assert.equal(suite.skipComment, 'comment');
        });

        it('should chain skip methods', () => {
            suiteBuilder.skip.in('ie11')
                .skip.in(/firefox/);

            assert.isTrue(suite.shouldSkip('ie11'));
            assert.isTrue(suite.shouldSkip('firefox33'));
            assert.isFalse(suite.shouldSkip('chrome'));
        });
    });

    describe('skip', () => {
        beforeEach(() => {
            sandbox.spy(suiteBuilder.skip, 'in');
        });

        it('should call skip.in method', () => {
            suiteBuilder.skip(['someArg'], 'comment');

            assert.calledWith(suiteBuilder.skip.in, ['someArg'], 'comment');
        });

        describe('falsey values', () => {
            const skipAllTest = (arg, argDescription = arg) => {
                return it(`should skip all if argument is ${argDescription}`, () => {
                    suiteBuilder.skip(arg);

                    assert.calledWith(suiteBuilder.skip.in, /.*/);
                });
            };

            skipAllTest(undefined);
            skipAllTest(false);
            skipAllTest(0);
            skipAllTest(null);
            skipAllTest('', 'empty string');
        });
    });

    describe('skip.notIn', () => {
        const errorMessage = 'Browsers must be string or RegExp objects';

        it('should throw if argument is not a string nor RegExp', () => {
            assert.throws(() => {
                suiteBuilder.skip.notIn(0);
            }, TypeError, errorMessage);
        });

        it('should throw if argument is array with non-string or non-RegExp', () => {
            assert.throws(() => {
                suiteBuilder.skip.notIn([false]);
            }, TypeError, errorMessage);
        });

        it('should throw if argument is an object', () => {
            assert.throws(() => {
                suiteBuilder.skip.notIn({browserName: 'name', version: '123', id: 'browser'});
            }, TypeError, errorMessage);
        });

        it('should throw if no argument', () => {
            assert.throws(() => {
                suiteBuilder.skip.in();
            }, TypeError, errorMessage);
        });

        it('should skip all browsers except string id', () => {
            suiteBuilder.skip.notIn('opera');

            assert.equal(suite.skipped.length, 1);
            assert.isFalse(suite.skipped[0].matches('opera'));
            assert.isTrue(suite.skipped[0].matches('firefox'));
        });

        it('should skip all browsers except RegExp', () => {
            suiteBuilder.skip.notIn(/ie1.*/);

            assert.isFalse(suite.skipped[0].matches('ie11'));
            assert.isTrue(suite.skipped[0].matches('ie8'));
        });

        it('should accept array of string ids and RegExp\'s', () => {
            suiteBuilder.skip.notIn([
                'ie11',
                /firefox/
            ]);

            assert.isTrue(suite.skipped[0].matches('chrome'));
            assert.isFalse(suite.skipped[0].matches('ie11'));
            assert.isFalse(suite.skipped[0].matches('firefox11'));
        });

        it('should accept comments', () => {
            suiteBuilder.skip.notIn('chrome', 'comment');

            assert.isTrue(suite.shouldSkip('firefox'));
            assert.equal(suite.skipComment, 'comment');
        });

        it('should chain skip.notIn methods', () => {
            suiteBuilder.skip.notIn('ie11', 'not in ie11')
                .skip.notIn(/firefox/, 'not in firefox');

            assert.isTrue(suite.shouldSkip('firefox33'));
            assert.equal(suite.skipComment, 'not in ie11');
            assert.isTrue(suite.shouldSkip('ie11'));
            assert.equal(suite.skipComment, 'not in firefox');
        });
    });

    describe('only.in', () => {
        let rootSuite;
        const errorMessage = 'Browsers must be string or RegExp objects';

        beforeEach(() => {
            rootSuite = Suite.create('');
            suite = Suite.create('some-suite', rootSuite);
            suiteBuilder = new SuiteBuilder(suite);
        });

        it('should throw without an argument', () => {
            assert.throws(() => {
                suiteBuilder.only.in();
            }, TypeError, errorMessage);
        });

        it('should throw if an argument is not a string or RegExp', () => {
            assert.throws(() => {
                suiteBuilder.only.in(0);
            }, TypeError, errorMessage);
        });

        it('should throw if argument is an array of non-strings or non-RegExps', () => {
            assert.throws(() => {
                suiteBuilder.only.in([false]);
            }, TypeError, errorMessage);
        });

        it('should remove all browsers if argument is an empty array', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.in([]);

            assert.deepEqual(suite.browsers, []);
        });

        it('should filter suite browsers by a string', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.in('chrome');

            assert.deepEqual(suite.browsers, ['chrome']);
        });

        it('should filter suite browsers by a RegExp', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.in(/ie.+/);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
        });

        it('should filter suite browsers by an array of strings', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.in(['chrome']);

            assert.deepEqual(suite.browsers, ['chrome']);
        });

        it('should filter suite browsers by an array of RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.in([/ie.+/]);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
        });

        it('should filter suite browsers by an array of strings and RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            suiteBuilder.only.in([/ie.+/, 'chrome']);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
        });

        it('should not set a browser for a suite if it is not specified in a root one', () => {
            rootSuite.browsers = ['opera'];

            suiteBuilder.only.in('chrome');

            assert.deepEqual(suite.browsers, []);
        });

        it('should be chainable', () => {
            assert.equal(suiteBuilder.only.in([]), suiteBuilder);
        });

        it('should filter browsers in all children suites', () => {
            const firstChild = Suite.create('firstChild', suite);
            const secondChild = Suite.create('secondChild', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            suiteBuilder.only.in([/ie.+/, 'chrome']);
            new SuiteBuilder(firstChild).only.in(/ie.+/);
            new SuiteBuilder(secondChild).only.in('chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
            assert.deepEqual(firstChild.browsers, ['ie8', 'ie9']);
            assert.deepEqual(secondChild.browsers, ['chrome']);
        });

        it('should pass filtered browsers from a parent suite to a child one', () => {
            const childSuite = Suite.create('child', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            suiteBuilder.only.in('chrome');

            assert.deepEqual(childSuite.browsers, ['chrome']);
        });
    });

    describe('browsers', () => {
        it('should call only.in method', () => {
            sandbox.spy(suiteBuilder.only, 'in');

            suiteBuilder.browsers('id1', /reg1/);

            assert.calledWith(suiteBuilder.only.in, 'id1', /reg1/);
        });
    });

    describe('only.notIn', () => {
        let rootSuite;
        const errorMessage = 'Browsers must be string or RegExp objects';

        beforeEach(() => {
            rootSuite = Suite.create('');
            suite = Suite.create('some-suite', rootSuite);
            suiteBuilder = new SuiteBuilder(suite);
        });

        it('should throw without an argument', () => {
            assert.throws(() => {
                suiteBuilder.only.notIn();
            }, TypeError, errorMessage);
        });

        it('should throw if an argument is not a string or RegExp', () => {
            assert.throws(() => {
                suiteBuilder.only.notIn(0);
            }, TypeError, errorMessage);
        });

        it('should throw if an argument is an array of non-strings or non-RegExps', () => {
            assert.throws(() => {
                suiteBuilder.only.notIn([false]);
            }, TypeError, errorMessage);
        });

        it('should do nothing if argument is an empty array', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.notIn([]);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
        });

        it('should filter suite browsers by a string', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.notIn('chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
        });

        it('should filter suite browsers by a RegExp', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.notIn(/ie.+/);

            assert.deepEqual(suite.browsers, ['chrome']);
        });

        it('should filter suite browsers by an array of strings', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.notIn(['chrome']);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
        });

        it('should filter suite browsers by an array of RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            suiteBuilder.only.notIn([/ie.+/]);

            assert.deepEqual(suite.browsers, ['chrome']);
        });

        it('should filter suite browsers by an array of strings and RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            suiteBuilder.only.notIn([/ie.+/, 'chrome']);

            assert.deepEqual(suite.browsers, ['opera']);
        });

        it('should not set a browser for a suite if all browsers are excluded', () => {
            rootSuite.browsers = ['opera'];

            suiteBuilder.only.notIn('opera');

            assert.deepEqual(suite.browsers, []);
        });

        it('should be chainable', () => {
            assert.equal(suiteBuilder.only.notIn(['cant use empty array']), suiteBuilder);
        });

        it('should filter browsers in all children suites', () => {
            const firstChild = Suite.create('firstChild', suite);
            const secondChild = Suite.create('secondChild', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            suiteBuilder.only.notIn(['opera']);
            new SuiteBuilder(firstChild).only.notIn(/ie.+/);
            new SuiteBuilder(secondChild).only.notIn('chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
            assert.deepEqual(firstChild.browsers, ['chrome']);
            assert.deepEqual(secondChild.browsers, ['ie8', 'ie9']);
        });

        it('should pass filtered browsers from a parent suite to a child one', () => {
            const childSuite = Suite.create('child', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            suiteBuilder.only.notIn('chrome');

            assert.deepEqual(childSuite.browsers, ['ie8', 'ie9', 'opera']);
        });
    });
});
