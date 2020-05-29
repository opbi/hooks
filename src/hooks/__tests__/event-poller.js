import eventPoller from '../event-poller';

describe('eventPoller', () => {
  it('return data combined from multi polling responses', async () => {
    const call = jest
      .fn()
      .mockReturnValueOnce({ finished: false, value: 'no' })
      .mockReturnValueOnce({ finished: false, value: 'no' })
      .mockReturnValueOnce({ finished: true, value: 'yes' });
    const decorated = eventPoller({
      until: (result) => result.finished,
    })(call);
    const data = await decorated();
    expect(data).toMatchSnapshot();
  });

  it('return data combined from multi polling calls with mapping', async () => {
    const original = jest
      .fn()
      .mockReturnValueOnce({ ok: false, value: 'no' })
      .mockReturnValueOnce({ ok: false, value: 'no' })
      .mockReturnValueOnce({ ok: true, value: 'yes' });
    const decorated = eventPoller({
      until: ({ ok }) => ok,
      mapping: ({ value }) => value,
    })(original);
    const result = await decorated();
    expect(result).toEqual(['no', 'no', 'yes']);
  });

  it('bypass the hook if until is not set', async () => {
    const original = jest
      .fn()
      .mockReturnValueOnce({ ok: false, value: 'no' })
      .mockReturnValueOnce({ ok: false, value: 'no' })
      .mockReturnValueOnce({ ok: true, value: 'yes' });
    const decorated = eventPoller()(original);
    const result = await decorated();
    expect(result).toEqual({ ok: false, value: 'no' });
  });

  it('poll with the set interval', async () => {
    const original = jest
      .fn()
      .mockReturnValueOnce('no')
      .mockReturnValueOnce('no')
      .mockReturnValueOnce('yes');
    const startTime = Date.now();
    const decorated = eventPoller({
      until: (result) => result === 'yes',
      interval: 2 * 1000,
    })(original);
    await decorated();
    const lapsed = Date.now() - startTime;
    expect(lapsed).toBeGreaterThan(6);
  });

  it('throws error if time exceeds the set timeout', async () => {
    const original = jest
      .fn()
      .mockReturnValueOnce('no')
      .mockReturnValueOnce('no')
      .mockReturnValueOnce('yes');
    const decorated = eventPoller({
      until: (result) => result === 'yes',
      interval: 2 * 1000,
      timeout: 2000,
    })(original);
    try {
      await decorated();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('throws error if the request has error', async () => {
    const original = jest
      .fn()
      .mockImplementationOnce(() => 'no')
      .mockImplementationOnce(() => {
        throw Error('expected');
      });
    const decorated = eventPoller({
      until: (result) => result === 'yes',
    })(original);

    try {
      await decorated();
    } catch (e) {
      expect(e.message).toBe('expected');
    }
  });
});
