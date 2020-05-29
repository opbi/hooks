import compose from 'compose-function';

import reserveName from './reserve-name';

/*
  enhanced compose function to attach reserveName enhancer to each decorator
  so that action function name can be passed through the chain
 */
const reserveNameCompose = (...args) => {
  const enhancedArgs = args.map((arg) => reserveName(arg));
  return compose(...enhancedArgs);
};

export default reserveNameCompose;
