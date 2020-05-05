/*
  when using curry/arrow functions to write decorators
  an anonymous function (.name: undefined) would be returned
  this helper helps to reserve the funcion name
 */
const setFunctionName = (targetFunction, name) => {
  const output = targetFunction;
  Object.defineProperty(output, 'name', {
    value: name,
    configurable: true,
  });
  return output;
};

/*
  a decorator enhancer
  used to enhance decorators to preserve the input function name
  reserveName(decorator)(inputFunction)(...args)
 */
const reserveName = decorators => inputFunction =>
  setFunctionName(decorators(inputFunction), inputFunction.name);

export default reserveName;
