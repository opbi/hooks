import eventLogger from '../event-logger';

const logger = {
  info: jest.fn(),
  error: jest.fn(),
};

describe('eventLogger', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('log the success event with param when enabled', async () => {
    const original = async ({ text }) => text;
    const decorated = eventLogger({ logParam: true })(original);
    const result = await decorated({ text: 'yes' }, {}, { logger });

    expect(result).toBe('yes');
    expect(logger.info.mock.calls).toMatchSnapshot();
  });

  it('log the success event with result when enabled', async () => {
    const original = async () => 'yes';
    const decorated = eventLogger({ logResult: true })(original);
    const result = await decorated({}, {}, { logger });

    expect(result).toBe('yes');
    expect(logger.info.mock.calls).toMatchSnapshot();
  });

  it('log chained events from upper level function call', async () => {
    const original = () => {};
    const upper = (p, m, c) => {
      return eventLogger()(original)(p, m, c);
    };
    await eventLogger()(upper)({}, {}, { logger });
    expect(logger.info.mock.calls).toMatchSnapshot();
  });

  it('log the error event when input function fails', async () => {
    const original = () => {
      const e = { message: 'error' };
      throw e;
    };
    const decorated = eventLogger()(original);

    try {
      await decorated({}, {}, { logger });
    } catch (e) {
      expect(e.message).toBe('error');
      expect(logger.info.mock.calls).toMatchSnapshot();
      expect(logger.error.mock.calls).toMatchSnapshot();
    }
  });

  it('log the parsed error when errorParse set', async () => {
    const original = () => {
      const e = new Error('error');
      throw e;
    };
    const decorated = eventLogger({
      errorParser: e => ({
        message: e.message,
        stack: e.stack.substring(0, 20),
      }),
    })(original);

    try {
      await decorated({}, {}, { logger });
    } catch (e) {
      expect(e.message).toBe('error');
      expect(logger.info.mock.calls).toMatchSnapshot();
      expect(logger.error.mock.calls).toMatchSnapshot();
    }
  });
});
