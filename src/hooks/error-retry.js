// @ts-check

import sleep from 'lib/sleep';
import addHooks from './helpers/add-hooks';

/**
 * A decorator to retry action until condition met or reach maxRetries.
 *
 * @template T
 * @typedef {import('./types').ErrorHookMethod<T>} ErrorHookMethod
 *
 * @param {object} options - Config.
 * @param {ErrorHookMethod<boolean>} [options.condition] - Condition to retry.
 * @param {number} [options.maxRetries] - Max times of retry.
 * @param {number} [options.delay] - Time to wait between retry.
 * @returns {object|Array}        The data returned from the original action call.
 */
const errorRetry = (options = {}) =>
  addHooks({
    errorHook: async (e, param, meta, context, action) => {
      const { condition = () => true, maxRetries = 3, delay } = options;
      const { retries = 0 } = meta;
      if (retries < maxRetries && condition(e, param, meta, context, action)) {
        if (delay) await sleep(delay);

        const updatedMeta = {
          ...meta,
          retries: retries + 1,
          maxRetries,
        };
        const result = await errorRetry(options)(action)(
          param,
          updatedMeta,
          context,
        );
        return result;
      }
      throw e;
    },
  });

export default errorRetry;
