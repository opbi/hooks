// @ts-check

/**
 * Adaptor to adapt (hooked) action function to express standard middleware/handler function signature.
 *
 * @param  {Object} options - Config
 * @param  {Function} [options.param] - Config on what variables passed to param
 * @param  {Function} [options.meta] - Config on what variables passed to meta
 * @param  {Function} [options.context] - Config on what variables passed to context, besides the default req, res, next
 * @returns {any} - the original result of the action function
 */
const adaptorExpress = ({
  param = (req) => req.body,
  meta = (req) => req.meta,
  context = () => {},
} = {}) => (action) => async (req, res, next) => {
  const p = param(req, res, next);
  const m = meta(req, res, next);
  const c = context(req, res, next);

  const result = await action(p, m, { ...c, req, res, next });

  return result;
};

export default adaptorExpress;
