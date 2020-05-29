import addHooks from '../add-hooks';

const callOrder = jest.fn();

const callOrderWithName = (hookName) => () => {
  callOrder(hookName);
};
const beforeHook = callOrderWithName('beforeHook');
const afterHook = callOrderWithName('afterHook');
const errorHook = callOrderWithName('errorHook');

describe('addHooks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('decorate input function with hooks and fire them in right order', async () => {
    const original = callOrderWithName('original');
    const decorated = addHooks({ beforeHook, afterHook, errorHook })(original);

    await decorated();

    expect(callOrder.mock.calls).toMatchSnapshot();
  });

  it('return the result of original function despite hooked', async () => {
    const original = () => 'result';
    const decorated = addHooks({ beforeHook, afterHook, errorHook })(original);

    const result = await decorated();

    expect(result).toBe('result');
  });

  it('tolerates empty config but ideally should be removed during usage', async () => {
    const original = () => 'result';
    const decorated = addHooks()(original);
    const result = await decorated();

    expect(result).toBe('result');
  });

  it('fire beforeHook and errorHook when throws an error', async () => {
    const original = () => {
      callOrder('original');
      const error = { message: 'error' };
      throw error;
    };

    const decorated = addHooks({ beforeHook, afterHook, errorHook })(original);

    try {
      await decorated();
    } catch (e) {
      expect(e.message).toBe('error');
      expect(callOrder.mock.calls).toMatchSnapshot();
    }
  });

  it('returns result from afterHook if it is set for modification or recursion', async () => {
    const original = (modification) => {
      callOrder('original');
      return modification ? 'modified result' : 'original result';
    };

    const recursiveAfterHook = (r, p, m, c, action) => {
      const result = action(true);
      return result;
    };

    const decorated = addHooks({ afterHook: recursiveAfterHook })(original);

    const result = await decorated();
    expect(result).toBe('modified result');
  });

  it('return result available in recursive errorHook instead of throwing an error', async () => {
    const original = (result) => {
      callOrder('original');
      if (result) {
        return 'result';
      }
      const error = { message: 'error' };
      throw error;
    };

    const recursiveErrorHookWithResult = (e, p, m, c, action) => {
      const result = action(true);
      return result;
    };

    const decorated = addHooks({ errorHook: recursiveErrorHookWithResult })(
      original,
    );

    const result = await decorated();
    expect(result).toBe('result');
  });

  it('bypass hooks when bypassHook condition met', async () => {
    const bypassHook = (param, meta, context) => !context.something;
    const original = callOrderWithName('original');
    const decorated = addHooks({
      bypassHook,
      beforeHook,
      afterHook,
      errorHook,
    })(original);

    await decorated();

    expect(callOrder.mock.calls).toMatchSnapshot();
  });

  it('persist store between hooks if set', async () => {
    const store = { foo: 'bar' };
    const storeHook = () => store;
    const original = () => 'yes';
    const decorated = addHooks({
      storeHook,
      beforeHook: (p, m, c, a, s) => {
        expect(s).toEqual(store);
      },
      afterHook: (r, p, m, c, a, s) => {
        expect(s).toEqual(store);
      },
    })(original);

    await decorated();
  });

  it('persist store to errorHook', async () => {
    const store = { foo: 'bar' };
    const storeHook = () => store;
    const original = () => {
      const error = { message: 'error' };
      throw error;
    };
    const decorated = addHooks({
      storeHook,
      errorHook: (e, p, m, c, a, s) => {
        expect(s).toEqual(store);
      },
    })(original);
    try {
      await decorated();
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });

  it('allow using actionHook to modify action with access to store', () => {
    const store = { foo: 'bar' };
    const storeHook = () => store;
    const original = () => {
      const error = { message: 'error' };
      throw error;
    };
    const actionHook = (p, m, c, a, s) => {
      expect(s).toEqual(store);
    };
    const decorated = addHooks({
      storeHook,
      actionHook,
    })(original);
    decorated();
  });
});
