import reserveNameCompose from '../reserve-name-compose';

import errorMute from '../../error-mute';
import eventLogger from '../../event-logger';

const logger = {
  info: jest.fn(),
  error: jest.fn(),
};

const callOrder = jest.fn();

const createMockDecorator =
  (decoratorName) =>
  (inputFunction) =>
  (...args) => {
    callOrder(decoratorName);
    return inputFunction(...args);
  };

const decorator = createMockDecorator('decorator0');
const decorator1 = createMockDecorator('decorator1');

describe('reserveNameCompose', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reserves the target function name if the whole chain of decorators are enhanced', () => {
    const original = () => {};
    const decorated = reserveNameCompose(decorator, decorator1)(original);
    expect(decorated.name).toBe('original');
  });

  it('essential for any decorator in the chain to access targetFunction.name if it is not on the first place', async () => {
    const original = () => {
      const e = { message: 'error' };
      throw e;
    };
    const decorated = reserveNameCompose(eventLogger(), errorMute())(original);

    try {
      const result = await decorated({}, {}, { logger });
      expect(result.message).toBe('error');
      expect(logger.info.mock.calls).toMatchSnapshot();
      expect(logger.error.mock.calls).toMatchSnapshot();
    } catch (e) {
      if (e) {
        throw Error('error is expected to be suppressed');
      }
    }
  });
});
