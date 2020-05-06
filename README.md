<h3 align="center">hooks</h3>
<p align="center" style="margin-bottom: 2em;"></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@opbi/hooks">
    <img alt="npm" src="https://img.shields.io/npm/v/@opbi/hooks.svg">
  </a>
  <a href="https://circleci.com/gh/opbi/workflows/hooks">
    <img alt="CircleCI" src="https://img.shields.io/circleci/project/github/opbi/hooks/master.svg">
  </a>
  <a href="https://coveralls.io/github/opbi/hooks?branch=master">
    <img alt="Coveralls" src="https://img.shields.io/coveralls/github/opbi/hooks/master.svg">
  </a>
  <a href="https://inch-ci.org/github/opbi/hooks">
    <img alt="inch-ci" src="http://inch-ci.org/github/opbi/hooks.svg?branch=master&style=shields">
  </a>
  <a href="https://github.com/semantic-release/semantic-release">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
</p>

<p align="center">
  <a href="https://snyk.io/test/github/opbi/hooks">
    <img alt="Known Vulnerabilities" src="https://snyk.io/test/github/opbi/hooks/badge.svg">
  </a>
  <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fopbi%2Fhooks?ref=badge_shield">
    <img alt="License Scan" src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fopbi%2Fhooks.svg?type=shield"/>
  </a>
  <a href="https://david-dm.org/opbi/hooks">
    <img alt="Dependencies" src="https://img.shields.io/david/opbi/hooks.svg">
  </a>
  <a href="https://david-dm.org/opbi/hooks?type=dev">
    <img alt="devDependencies" src="https://img.shields.io/david/dev/opbi/hooks.svg">
  </a>
  <a href="https://scrutinizer-ci.com/g/opbi/hooks/?branch=master">
    <img alt="Scrutinizer Code Quality" src="https://img.shields.io/scrutinizer/g/opbi/hooks.svg">
  </a>
</p>

---

### Purpose

#### Consistency as Toolings (CasT)

> what to observability and control patterns, like linters to code styles

By standardise common error handling, observability logic or other patterns as reusable modules, it ensures consistency of observability standards across micro-services, codebases or teams.

```js
/* handler.js */
import logger, metrics from '@opbi/toolchain';
import { eventLogger, eventTimer } from '@opbi/hooks';

const withObserver = chain(eventLogger, eventTimer);
const getSubscription = withObserver(userProfileApi.getSubscription);
const cancelSubscription = withObserver(subscriptionApi.cancel)

const handleUserCancelSubscription = async ({ userId }, meta, context) => {
  const { subscriptionId } = await getSubscription( { userId }, meta, context );
  await cancelSubscription({ subscriptionId }, meta, context);
};

export default withObserver(handleUserCancelSubscription);

/* router.js */
import handleUserCancelSubscription from './handler.js';

await handleUserCancelSubscription({ userId }, meta, { logger, metrics });
```
Hooks can automate standardised log, metrics and tracing in a structure reflecting the call stacks. This greatly improves observability coverage and makes monitor and debugging a breeze with good precision locating problematic function.

```shell
[info] event: handleUserCancelSubscription
[info] event: handleUserCancelSubscription.getSubscription
[error] event: handleUserCancelSubscription.cancelSubscription, type: TimeoutError
```

#### Readability, Reusability, Testability (RRT)

Turn scattered repeatitive control mechanism or observability code from interwined blocks to more readable, reusable, testable ones.

By abstract out common control mechanism and observability code into well-tested, composable hooks, it can effectively half the verboseness of your code. This helps to achieve codebase that is self-explanatory of its business logic and technical behaviour. Additionally, conditionally turning certain mechanism off makes testing the code very handy.

Let's measure the effect in LOC (Line of Code) and LOI (Level of Indent) by an example of cancelling user subscription on server-side with some minimal error handling of retry and restore. The simplification effect will be magnified with increasing complexity of the control mechanism.

> Using @opbi/hooks Hooks: LOC = 16, LOI = 2
```js
// import userProfileApi from './api/user-profile';
// import subscriptionApi from './api/subscription';
// import restoreSubscription from './restore-subscription'

import { errorRetry, errorHandler, chain } from '@opbi/hooks';

const retryOnTimeoutError = errorRetry({
  condition: e => e.type === 'TimeoutError'
});

const restoreOnServerError = errorHandler({
  condition: e => e.code > 500,
  handler: (e, p, m, c) => restoreSubscription(p, m, c),
});

const cancelSubscription = async ({ userId }, meta, context) => {
  const { subscriptionId } = await chain(
    retryOnTimeoutError
  )(userProfileApi.getSubscription)( { userId }, meta, context );

  await chain(
    errorRetry(), restoreOnServerError,
  )(subscriptionApi.cancel)({ subscriptionId }, meta, context);
};

// export default cancelSubscription;
```

> Vanilla JavaScript: LOC = 32, LOI = 4
```js
// import userProfileApi from './api/user-profile';
// import subscriptionApi from './api/subscription';
// import restoreSubscription from './restore-subscription'

const cancelSubscription = async ({ userId }, meta, context) => {
  let subscriptionId;

  try {
    const result = await userProfileApi.getSubscription({ userId }, meta, context);
    subscriptionId = result.subscriptionId;
  } catch (e) {
    if(e.type === 'TimeoutError'){
      const result = await userProfileApi.getSubscription({ userId }, meta, context);
      subscriptionId = result.subscriptionId;
    }
    throw e;
  }

  try {
    try {
      await subscriptionApi.cancel({ subscriptionId }, meta, context);
    } catch (e) {
      if(e.code > 500) {
        await restoreSubscription({ subscriptionId }, meta, context);
      }
      throw e;
    }
  } catch (e) {
    try {
      return await subscriptionApi.cancel({ subscriptionId }, meta, context);
    } catch (e) {
      if(e.code > 500) {
        await restoreSubscription({ subscriptionId }, meta, context);
      }
      throw e;
    }
  }
};

// export default cancelSubscription;
```

---
### How to Use

#### Install
```shell
yarn add @opbi/hooks
```

#### Standard Function

Standardisation of function signature is powerful that it creates predictable value flows throughout the functions and hooks chain, making functions more friendly to meta-programming. Moreover, it is also now a best-practice to use object destruct assign for key named parameters.

Via exploration and the development of hooks, we set a function signature standard to define the order of different kinds of variables as expected and we call it `action function`:
```js
/**
 * The standard function signature.
 * @param  {object} param   - parameters input to the function
 * @param  {object} meta    - metadata tagged for function observability(logger, metrics), e.g. requestId
 * @param  {object} context - contextual callable instances or unrecorded metadata, e.g. logger, req
 */
function (param, meta, context) {}
```

#### Config the Hooks

All the hooks in @opbi/hooks are configurable with possible default settings.

In the [cancelSubscription](##readability-reusability-testability-rrt) example, *errorRetry()* is using its default settings, while *restoreOnServerError* is configured *errorHandler*. Descriptive names of hook configurations help to make the behaviour very self-explanatory. Patterns composed of configured hooks can certainly be reused.

```js
const restoreOnServerError = errorHandler({
  condition: e => e.code > 500,
  handler: (e, p, m, c) => restoreSubscription(p, m, c),
});
```

#### Chain the Hooks

> "The order of the hooks in the chain matters."

<a href="https://innolitics.com/articles/javascript-decorators-for-promise-returning-functions/">
  <img alt="decorators" width="640" src="https://innolitics.com/img/javascript-decorators.png"/>
</a>

Under the hood, the hooks are implemented in the [decorators](https://innolitics.com/articles/javascript-decorators-for-promise-returning-functions) pattern. The pre-hooks, action function, after-hooks/error-hooks are invoked in a pattern as illustrated above. In the [cancelSubscription](##readability-reusability-testability-rrt) example, as *errorRetry(), restoreOnServerError* are all error hooks, *restoreOnServerError* will be invoked first before *errorRetry* is invoked.

---
#### Ecosystem

Currently available hooks:

* [errorCounter](https://github.com/opbi/hooks/blob/master/src/hooks/error-counter.js)
* [errorHandler](https://github.com/opbi/hooks/blob/master/src/hooks/error-handler.js)
* [errorMute](https://github.com/opbi/hooks/blob/master/src/hooks/error-mute.js)
* [errorRetry](https://github.com/opbi/hooks/blob/master/src/hooks/error-retry.js)
* [errorTag](https://github.com/opbi/hooks/blob/master/src/hooks/error-tag.js)
* [eventLogger](https://github.com/opbi/hooks/blob/master/src/hooks/event-logger.js)
* [eventPoller](https://github.com/opbi/hooks/blob/master/src/hooks/event-poller.js)
* [eventTimer](https://github.com/opbi/hooks/blob/master/src/hooks/event-timer.js)

> Hooks are named in a convention to reveal where and how it works `[hook point][what it is/does]`, e.g. *errorCounter, eventLogger*. Hook points are named `before, after, error` and `event` (multiple points).

#### Extension

You can easily create more standardised hooks with [addHooks](https://github.com/opbi/hooks/blob/master/src/hooks/helpers/add-hooks.js) helper. Open source them aligning with the above standards via pull requests or individual packages are highly encouraged.

---
#### Decorators
Hooks here are essentially configurable decorators, while different in the way of usage. We found the name 'hooks' better describe the motion that they are attached to functions not modifying their original data process flow (keep it pure). Decorators are coupled with class methods, while hooks help to decouple definition and control, attaching to any function on demand.

```js
//decorators
class SubscriptionAPI:
  //...
  @errorRetry()
  cancel: () => {}
```
```js
//hooks
  chain(
    errorRetry()
  )(subscriptionApi.cancel)
```
#### Adaptors
To make plugging in @opbi/hooks hooks to existing systems easier, adaptors are introduced to bridge different function signature standards.
```js
const handler = chain(
  adaptorExpress(),
  errorRetry()
)(subscriptionApi.cancel)

handler(req, res, next);
```
#### Refactor
To help adopting the hooks by testing them out with minimal refactor on non-standard signature functions, there's an unreleased [adaptor](https://github.com/opbi/toolchain/blob/adapator-non-standard/src/hooks/adaptors/nonstandard.js) to bridge the function signatures. It is not recommended to use this for anything but trying the hooks out, especially observability hooks are not utilised this way.

#### Reducers
Integration with Redux is TBC.

#### Pipe Operator
We are excited to see how pipe operator will be rolled out and hooks can be elegantly plugged in.
```js
const cancelSubscription = ({ userId }, meta, context)
  |> chain(timeoutErrorRetry)(userProfileApi.getSubscription)
  |> chain(restoreOnServerError, timeoutErrorRetry)(subscriptionApi.cancel);
```
---
### Inspiration
* [Financial-Times/n-express-monitor](https://github.com/Financial-Times/n-express-monitor)
* [recompose](https://github.com/acdlite/recompose)
* [ramda](https://github.com/ramda/ramda)
* [funcy](https://github.com/suor/funcy/)
---
### License
[MIT](License)
