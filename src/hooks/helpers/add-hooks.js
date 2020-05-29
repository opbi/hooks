// @ts-check

/**
 * An opinionated decorator creator to ensure predictable behaviour with light test.
 *
 * @typedef {import('../types').BypassHook} BypassHook
 * @typedef {import('../types').StoreHook} StoreHook
 * @typedef {import('../types').BeforeHook} BeforeHook
 * @typedef {import('../types').ActionHook} ActionHook
 * @typedef {import('../types').AfterHook} AfterHook
 * @typedef {import('../types').ErrorHook} ErrorHook
 * @typedef {import('../types').Decorator} Decorator
 *
 * @param {Object} options - Options.
 * @param {BypassHook} [options.bypassHook] - Define a condition to bypass the decorator.
 * @param {StoreHook} [options.storeHook] -  Define a function to prepare values to be accessed by other hooks.
 * @param {BeforeHook} [options.beforeHook] - Define a function to be executed before calling action.
 * @param {ActionHook} [options.actionHook] - Define a function to return an augumented action with updated args.
 * @param {AfterHook} [options.afterHook] - Define a function to be executed after the action call succeeds.
 * @param {ErrorHook} [options.errorHook] - Define a function to be executed if error is thrown from action call.
 * @returns {Decorator} The decorator with behaviour defined by the hooks and returns the expected result of the action.
 */
const addHooks = ({
  bypassHook = () => false,
  storeHook = () => {},
  beforeHook = () => {},
  actionHook = (param, meta, context, action) => action(param, meta, context),
  afterHook = () => {},
  errorHook = () => {},
} = {}) => (action) => async (param, meta = {}, context = {}) => {
  if (bypassHook(param, meta, context)) return action(param, meta, context);

  const store = storeHook(param, meta, context, action);

  try {
    await beforeHook(param, meta, context, action, store);

    const result = await actionHook(param, meta, context, action, store);

    const afterHookResult = await afterHook(
      result,
      param,
      meta,
      context,
      action,
      store,
    );

    if (afterHookResult !== undefined) {
      return afterHookResult;
    }

    return result;
  } catch (e) {
    const errorHookResult = await errorHook(
      e,
      param,
      meta,
      context,
      action,
      store,
    );

    if (errorHookResult !== undefined) {
      return errorHookResult;
    }

    throw e;
  }
};

export default addHooks;
