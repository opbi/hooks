<p align="center">
  <img alt="hooks" src="https://raw.githubusercontent.com/opbi/logo/master/hooks/hooks.svg" width="160">
</p>

<h3 align="center">hooks</h3>
<p align="center" style="margin-bottom: 2em;">opinionated decorator suite for easy cross-service consistency and self-explanatory codebase</p>

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

#### Easy Consistency as Toolings

By packing all standardisable patterns such as observarability, error handling, etc. as reusable decorators, it promotes and ensures consistency across micro-services and teams. This greatly improves the monitor efficiency and debugging experience. 

It is a very simple package and many companies probably have similar ones built in-house, while this package aims at providing the most maintainable, concise and universal solution to the common problem.


```js
/* api.js - common behaviour can be declared by decorators */
class UserProfileAPI
  //...
  @eventLogger()
  @eventTimer()
  getSubscription({ userId }):
    //...

class SubscriptionAPI
  //...
  @eventLogger()
  @eventTimer()
  @errorRetry({ condition: e => e.type === 'TimeoutError' })
  cancel({ SubscriptionId }):
    //...

/* handler.js - an illustration of the business logic */
import { UserProfileAPI, SubscriptionAPI } from './api.js';

/**
  user cancel subscription
  @param {string} param.userId
**/
export const userCancelSubscription = ({ userId }, meta, context)
  |> UserProfileAPI.getSubscription
  |> SubscriptionAPI.cancel
  
```

> With the decorator and pipe operators being enabled, we can easily turn the codebase into an illustration of business logic and technical behaviour. They also work greatly [without the operators](#without-decorator-and-pipe-operators). Those decorators work out of box with minimum configuration with the [opionated function signature]( 
#opinionated-function-signature).

The structured log it produced below obviously helps to precisely pinpoint the error function with param to reproduce the case. This can be easily further integrated into automated cross-team alerting and debugging system.

```shell
[info] event: userCancelSubscription.getSubscription
[error] event: userCancelSubscription.cancelSubscription, type: TimeoutError, Retry: 1, Param: { subscriptionId: '4672c33a-ff0a-4a8c-8632-80aea3a1c1c1' }
```


#### Business Logic in Self-Expanatory Code

By abstract out all common control mechanism and observability code into well-tested, composable decorators, this also helps to achieve codebase that is self-explanatory of its business logic and technical behaviour by the names of functions and decorators. This is great for testing and potentially rewrite the entire business logic functions as anything other than business logic is being packed into well-tested reusable decorators, which can be handily mocked during test.



---
### How to Use

#### Install
```shell
yarn add @opbi/hooks
```

#### Config the Hooks

All the hooks in @opbi/hooks come with a default configuration.

```js
errorRetry()(stepFunction)
```

Descriptive names of hook configurations help to make the behaviour more self-explanatory.

```js
const errorRetryOnTimeout = errorRetry({ condition: e => e.type === 'TimeoutError' })
```

Patterns composed of configured hooks can certainly be reused.

```js
const monitor = chain(eventLogger(), eventTimer(), eventTracer());
```

#### Chain the Hooks

> "The order of the hooks in the chain matters."

<a href="https://innolitics.com/articles/javascript-decorators-for-promise-returning-functions/">
  <img alt="decorators" width="640" src="https://innolitics.com/img/javascript-decorators.png"/>
</a>

#### Opinionated Function Signature

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

#### Refactor
To help adopting the hooks by testing them out with minimal refactor on non-standard signature functions, there's an unreleased [adaptor](https://github.com/opbi/toolchain/blob/adapator-non-standard/src/hooks/adaptors/nonstandard.js) to bridge the function signatures. It is not recommended to use this for anything but trying the hooks out, especially observability hooks are not utilised this way.

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
### Integration

#### Without Decorator and Pipe Operators

> We are calling those decorators **hooks(decorators at call-time beside definition-time)** to indicate that they can be used at any point of a business logic function lifecycle to extend highly flexible and precise control.

```js
/* handler.js - configure and attach hooks to business logic steps with hookEachPipe */
import { hookEachPipe, eventLogger, eventTimer } from '@opbi/hooks';
import { UserProfileAPI, SubscriptionAPI } from './api.js';

export const userCancelSubscription = async hookEachPipe(
  // all with default configuration applied to each step below
  eventLogger(), eventTimer() 
)(
  UserProfileAPI.getSubscription, 
  // precise control with step only hook
  chain(
    errorRetry({ condition: e => e.type === 'TimeoutError' })
  )(SubscriptionAPI.cancel),
);
```

#### Integrate with Server Frameworks

Those hook enhanced functions can be seemlessly plugged into server frameworks with the adaptor provided, e.g. Express.

```js
/* app.js - setup logger, metrics and adapt the express router to use hook signature */
import express from 'express';
import logger, metrics from '@opbi/toolchain';
import { adaptorExpress } from '@opbi/hooks';

export default adaptorExpress(express, { logger, metrics });

/* router.js - use the handler with automated logger, metrics */
import app from './app.js';
import { handleUserCancelSubscription } from './handler.js';

app.delete('/subscription/:userId', handleUserCancelSubscription);
```

#### Integrate with Redux
Integration with Redux is TBC.

---
### Inspiration
* [Financial-Times/n-express-monitor](https://github.com/Financial-Times/n-express-monitor)
* [recompose](https://github.com/acdlite/recompose)
* [ramda](https://github.com/ramda/ramda)
* [funcy](https://github.com/suor/funcy/)
---
### License
[MIT](License)
