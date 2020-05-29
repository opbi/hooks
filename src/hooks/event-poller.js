// @ts-check

import sleep from 'lib/sleep';
import addHooks from './helpers/add-hooks';

/**
 * A decorator used to poll remote endpoint with action.
 *
 * @param {Object} config - Config.
 * @param {Function} [config.until] - The function to set conditions to stop the polling and return the data.
 * @param {Function} [config.mapping] - The mapping function to transform response to the data format needed.
 * @param {number}  [config.interval] - Time to wait between each polling call.
 * @param {number}  [config.timeout] - The max time to wait for the polling before abort it.
 * @returns {Function}        The decorated function returns the polling result.
 */
const eventPoller = ({
  until,
  mapping = (res) => res,
  interval = 1000,
  timeout = 30 * 1000,
} = {}) =>
  addHooks({
    bypassHook: () => !until,
    storeHook: (p, m, context) => {
      // initial pollingStart time needs to be set before action
      //
      // if it has been previously passed to action function args
      // then get it from args.context
      const { pollingStart = Date.now(), pollingData = [] } = context;
      return { pollingStart, pollingData };
    },
    afterHook: async (r, p, m, c, action, { pollingData, pollingStart }) => {
      pollingData.push(mapping(r));

      if (until(r)) return pollingData;

      if (Date.now() - pollingStart > timeout) {
        throw Error('polling timeout');
      }

      await sleep(interval);

      // pass pollingStart, pollingData to context of the next call
      // so that internal state can be passed between action calls
      return eventPoller({ until, mapping, interval, timeout })(action)(p, m, {
        ...c,
        pollingData,
        pollingStart,
      });
    },
  });

export default eventPoller;
