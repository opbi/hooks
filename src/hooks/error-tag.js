// @ts-check

import addHooks from './helpers/add-hooks';

/**
 * A decorator used on actions when they are not chained with a logged upper-level call
   this decorator attaches action name to the error then being thrown to a logged level.
 *
 * @template T
 * @typedef {import('./types').ErrorHookMethod<T>} ErrorHookMethod
 *
 * @param {object} options - Config.
 * @param {ErrorHookMethod<object>} [options.tag] - Function to append what to tag to the error.
 */
const errorTag = ({
  tag = (e, p, m, c, a) => ({
    action: a.name,
    message: e.message,
    constructor: e.constructor.name,
    stack: e.stack.split('\n').map(s => s.trim()),
  }),
} = {}) =>
  addHooks({
    errorHook: (e, p, m, c, a) => {
      const taggedError = tag(e, p, m, c, a);
      throw taggedError;
    },
  });

export default errorTag;
