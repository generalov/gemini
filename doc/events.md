# Gemini events

Events are listed in order they are called.

* `CLI` - emitted right at start, before cli is parsed. Allows to add new commands and extend help message. The event is emitted with 1 argument `parser` which is the [commander](https://github.com/tj/commander.js) instance used inside gemini itself.

* `INIT` - emitted before any job start (`test`, `update` or `readTests`). If handler returns a promise then job will start only after the promise will be resolved. Emitted only once no matter how many times job will be performed.

* `BEFORE_FILE_READ` — emitted before each test file is read. The event is emitted
  with 1 argument `filePath` which is the absolute path to the file to be read.

* `AFTER_FILE_READ` — emitted after each test file have been read. The event is
  emitted with 1 argument `filePath` which is the absolute path to the file that
  was read.

* `AFTER_TESTS_READ` - emitted after all tests were read (during `test`, `update` or `readTests` call). The event is emitted with 1 argument `data`:
    * `data.suiteCollection` - suite collection with all suites parsed from test files

* `START_RUNNER` — emitted before the start of `test` or `update` command. If
  you return a promise from the event handler, the start of the command will
  be delayed until the promise resolves.
  
* `BEGIN` — runner event. Emitted on runner start with 1 argument `data`:
  * `data.suiteCollection` — suite collection which will be run
  * `data.config` — gemini config
  * `data.totalStates` — number of states in collection
  * `data.browserIds` — all browser ids from config
  
* `BEGIN_SUITE` — emitted before decide if should test suite in
specified browser. Event emitted with 1 argument `data`:
  * `data.suite`
  * `data.browserId`
  
* `SKIP_STATE` – emitted if browser is skipped in this state
with 1 argument `data`:
  * `data.suite`
  * `data.state`
  * `data.browserId`
  
* `START_BROWSER` — emitted on browser session start. Emitted with [browser instance](../lib/browser/new-browser.js). If handler returns a promise tests will be executed in this session only after the promise is resolved.

* `BEGIN_STATE` – emitted before launching browser for test
with 1 argument `data`:
  * `data.suite`
  * `data.state`
  * `data.browserId`
  * `data.sessionId`

* `UPDATE_RESULT` — emitted always during update. The event is emitted with 1 argument `result`:
    * `result.imagePath` — absolute path to the reference image
    * `result.updated` — boolean value which is `true` when reference image have been changed and `false` when not
    * `result.suite`
    * `result.state`
    * `result.browserId`
    * `result.sessionId`

* `RETRY` – emitted if test has failed but **there is still number
of retries left**. Event emitted with 1 argument `result`:
    * `result.referencePath` — absolute path to the reference image
    * `result.currentPath` — absolute path to the current image on your disk
    * `result.equal` — always `false` for retries
    * `result.tolerance` – tolerance, specified for current test or globally in `.gemini.js`
    * `result.saveDiffTo` — function is responsible for building diff and present in the `result` only if images aren't equal
    * `result.attempt` – number of retry for browser in current test
    * `result.retriesLeft` – number of left retries `> 0`, when number hits
    `0`, event `TEST_RESULT` will be called instead
    * `result.suite`
    * `result.state`
    * `result.browserId`
    * `result.sessionId`

* `TEST_RESULT` — emitted always after the test is completed. The event is emitted with 1 argument `result`:
    * `result.referencePath` — absolute path to the reference image
    * `result.currentPath` — ab¡solute path to the current image on your disk
    * `result.equal` — boolean value which is `true` when images are equal and `false` when aren't
    * `result.tolerance` – tolerance, specified for current test or globally in `.gemini.js`
    * `result.saveDiffTo` — function is responsible for building diff and present in the `result` only if images aren't equal
    * `result.suite`
    * `result.state`
    * `result.browserId`
    * `result.sessionId`

* `END_STATE` – emitted right after `UPDATE_RESULT` and `TEST_RESULT`
with 1 argument `data`:
    * `data.suite`
    * `data.state`
    * `data.browserId`
    * `data.sessionId`

* `STOP_BROWSER` — emitted right before browser session end. Emitted with [browser instance](../lib/browser/new-browser.js). If handler returns a promise quit will be performed only after the promise is resolved.

* `END_SUITE` – emitted right after suite is skipped or tested in specified browser.
Emitted with 1 argument `data`:
  * `data.suite` – tested suite
  * `data.browserId` – skipped or tested browser

* `ERROR` – emitted with 1 argument `err`, which is an instance
of `Error` and has additional fields depending on cause
of error.

    For example, if _reference image is missing_,
    `err` will have additional fields:
    * `err.currentPath`
    * `err.refImagePath`
    * `err.suite`
    * `err.state`
    * `err.browserId`
    * `err.sessionId`

* `INTERRUPT` — emitted on signal events `SIGHUP`, `SIGINT` or `SIGTERM`. The event is emitted with 1 argument `data`:
    * `data.exitCode` — exit code with which gemini will be interrupted

* `END` – emitted when all tests are completed with
1 argument `stat`, which contains statistics for tests.
 
   For example:
 
    ```js
    {
      total: 6,
      updated: 0,
      passed: 2,
      failed: 1,
      skipped: 3,
      retries: 8
    }
    ```

* `END_RUNNER` — emitted after the end of the `test` or `update` command.