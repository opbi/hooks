import errorMute from '../error-mute';

describe('errorMute', () => {
  it('mute all errors if no config set', async () => {
    const original = () => {
      const e = { message: 'error' };
      throw e;
    };
    const decorated = errorMute()(original);

    try {
      const result = await decorated();
      expect(result.message).toBe('error');
    } catch (e) {
      if (e) {
        throw Error('error is expected to be suppressed');
      }
    }
  });

  it('pass errors not met conditions set', async () => {
    const original = () => {
      const e = { type: 'TypeError' };
      throw e;
    };
    const decorated = errorMute({
      condition: (e) => e.type === 'TimeoutError',
    })(original);

    try {
      await decorated();
    } catch (e) {
      expect(e.type).toBe('TypeError');
    }
  });
});
