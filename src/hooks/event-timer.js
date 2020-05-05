// @ts-check

import addHooks from './helpers/add-hooks';

/**
 * A decorator to timing action execution time in both success/error cases
  and send metrics using the client attached in context.
 *
 * @template T
 * @typedef {import('./types').StorageHookMethod<T>} StorageHookMethod
 *
 * @param {object} options - Config.
 * @param {StorageHookMethod<object>} [options.parseLabel] - Function use to include labels that are not directly presented in meta.
 */
const eventTimer = ({ parseLabel = () => {} } = {}) =>
  addHooks({
    bypassHook: (p, m, { metrics }) => !metrics,
    storeHook: (p, m, c, a) => {
      const { metrics } = c;
      const timer = metrics.find({ action: a.name, type: 'timer' });
      const stopTimer = timer.start({ ...m, ...parseLabel(p, m, c) });
      return { stopTimer };
    },
    afterHook: (r, p, m, c, a, { stopTimer }) => {
      stopTimer();
    },
    errorHook: (e, p, m, c, a, { stopTimer }) => {
      stopTimer();
    },
  });

export default eventTimer;
