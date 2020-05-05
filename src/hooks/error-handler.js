// @ts-check

import addHooks from './helpers/add-hooks';

/**
 * A decorator to add conditional side-effect before error being thrown
  e.g. It can be used together with error-metrics to create conditional error-metrics
  e.g. It can also be used to handle specific error by throw error in the handler.
 *
 * @template T
 * @typedef {import('./types').ErrorHookMethod<T>} ErrorHookMethod
 *
 * @param {object} options - Config.
 * @param {ErrorHookMethod<boolean>} [options.condition] - Condition to call the handler.
 * @param {ErrorHookMethod<void>} [options.handler] - What to do when the condition met.
 */
const errorHandler = ({ condition = () => false, handler = () => {} } = {}) =>
  addHooks({
    errorHook: (e, p, m, c, a) => {
      if (condition(e, p, m, c, a)) {
        handler(e, p, m, c, a);
      }
    },
  });

export default errorHandler;
