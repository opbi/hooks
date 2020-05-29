// @ts-check

import addHooks from './helpers/add-hooks';

/**
 * A decorator to attach standard log behaviour to action
  bypass: when logger instance is not available in context
  augment: parse action name and added to action meta to be chained in sub-actions
  after: log success event, with options to include param and result
  error: log error event, with option to parse error.
 *
 * @param {object} options - Config.
 * @param {boolean} [options.logParam] - If include param in the log.
 * @param {boolean} [options.logResult] - If log the result.
 * @param {(error: Error|object) => object} [options.errorParser] - Parse the error to keep only useful information from the error in the log.
 */
const eventLogger = ({ logParam, logResult, errorParser = (e) => e } = {}) =>
  addHooks({
    bypassHook: (p, m, c) => !c.logger,
    storeHook: (p, meta, c, action) => {
      const { name } = action;
      const event = meta.event ? `${meta.event}.${name}` : name;
      return { event };
    },
    actionHook: (p, meta, c, a, { event }) => a(p, { ...meta, event }, c),
    afterHook: (result, param, meta, { logger }, a, { event }) => {
      const log = {
        ...meta,
        event,
        ...(logParam ? { param } : {}),
        ...(logResult ? { result } : {}),
      };
      logger.info(log, event);
    },
    errorHook: (e, p, meta, { logger }, a, { event }) => {
      logger.error({ ...meta, event, error: errorParser(e) }, e.message);
    },
  });

export default eventLogger;
