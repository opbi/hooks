import errorTag from '../error-tag';

describe('errorTag', () => {
  it('preserve .stack from the error and name of the action', async () => {
    const original = () => {
      const error = Error('error');
      throw error;
    };
    const decorated = errorTag()(original);

    try {
      await decorated();
    } catch (e) {
      expect(e.stack).toBeDefined();
      expect(e.action).toBe('original');
    }
  });
});
