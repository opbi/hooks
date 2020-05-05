/**
 * Join two strings with a space.
 *
 * @param {string} a - The first param.
 * @param {string} b - The second param.
 * @returns {string} - The result.
 */
export const join = (a, b) => `${a} ${b}`;

/**
 * An example function to show JSDoc works with object destruction in function params.
 *
 * @typedef {import('./decorator')} Validator
 */
export const allStrings = (...args) => {
  const argTypes = args.map(arg => typeof arg);
  if (argTypes.some(type => type !== 'string')) return false;
  return true;
};
