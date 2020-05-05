// @ts-check

import addHooks from './helpers/add-hooks';

/**
 * A decorator to mute errors when conditions are met.
 *
 * @template T
 * @typedef {import('./types').ErrorHookMethod<T>} ErrorHookMethod
 *
 * @param {object} options - Config.
 * @param  {ErrorHookMethod<boolean>} [options.condition] - Condition to mute the error.
 * @returns {Error|object|undefined} - If the error is muted(not thrown to upper level) it is accessible in the return value.
 */
const errorMute = ({ condition = () => true } = {}) =>
  addHooks({
    errorHook: (e, p, m, c, a) => (condition(e, p, m, c, a) ? e : undefined),
  });

export default errorMute;
