import compose from 'compose-function';

import reserveName from '../reserve-name';

const callOrder = jest.fn();

const createMockDecorator = decoratorName => inputFunction => (...args) => {
  callOrder(decoratorName);
  return inputFunction(...args);
};

const decorator = createMockDecorator('decorator0');

describe('reserveName', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('without it, curry format decorator return anonymouse function', () => {
    const original = () => {};
    const decorated = decorator(original);
    expect(decorated.name).toBe('');
  });

  it('returns function with configurable name same as the input function', () => {
    const original = () => {};
    const decorated = reserveName(decorator)(original);
    expect(decorated.name).toBe('original');
  });

  it('the reserved name will be lost if one decorator is not enhanced in chaining', () => {
    const original = () => {};
    const decorator1 = createMockDecorator('decorator1');
    const decorated = compose(reserveName(decorator), decorator1)(original);
    expect(decorated.name).toBe('');
  });

  it('reserves the target function name if the whole chain of decorators are enhanced', () => {
    const original = () => {};
    const decorator1 = createMockDecorator('decorator1');
    const decorated = compose(
      reserveName(decorator),
      reserveName(decorator1),
    )(original);
    expect(decorated.name).toBe('original');
  });
});
