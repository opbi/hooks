import inputValidation from './decorator';
import { FOO, BAR } from './constants';
import { allStrings, join } from './utils';

/**
 * An example function just to show the build and ci pipeline works.
 *
 * @returns {string} Hello world.
 */
export default () =>
  inputValidation({
    validator: allStrings,
  })(join)(FOO, BAR);
