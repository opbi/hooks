import errorRetry from '../error-retry';

describe('errorRetry', () => {
  it('retry until default maxRetries if config/condition not set', async () => {
    const original = jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error('timeout');
      })
      .mockImplementationOnce(() => {
        throw Error('timeout');
      })
      .mockImplementationOnce(() => {
        throw Error('error');
      });
    const decorated = errorRetry()(original);
    try {
      await decorated();
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });

  it('retries until condition met', async () => {
    const original = jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error('timeout');
      })
      .mockImplementationOnce(() => {
        throw Error('error');
      });
    const condition = e => e.message === 'timeout';
    const decorated = errorRetry({
      condition,
      maxRetries: 2,
    })(original);
    try {
      await decorated();
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });

  it('retries until result returned', async () => {
    const original = jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error('timeout');
      })
      .mockImplementationOnce(() => {
        return 'yes';
      });
    const condition = e => e.message === 'timeout';
    const decorated = errorRetry({
      condition,
    })(original);
    const result = await decorated();
    expect(result).toBe('yes');
  });

  it('delays if specified', async () => {
    const original = jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error('timeout');
      })
      .mockImplementationOnce(() => {
        return 'yes';
      });
    const condition = e => e.message === 'timeout';
    const startTime = Date.now();
    const decorated = errorRetry({
      condition,
      delay: 2000,
    })(original);
    await decorated();
    const lapsed = Date.now() - startTime;
    expect(lapsed).toBeGreaterThan(2);
  });
});
