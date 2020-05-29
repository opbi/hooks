import adaptorExpress from '../express';

import eventLogger from '../../event-logger';

const resMock = {
  send: jest.fn(),
};
const nextMock = jest.fn();
const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
};

describe('adaptorExpress', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has default pattern to adapt action to express function', async () => {
    const handlerAction = ({ count }, meta, { res }) => {
      res.send(count);
    };

    const handler = adaptorExpress()(handlerAction);

    const req = {
      contentType: 'json',
      meta: {
        requestId: '57cec994-ea1e-4555-81d6-45de628c3af9',
      },
      body: {
        count: 1,
      },
      logger: loggerMock,
    };

    await handler(req, resMock, nextMock);

    expect(resMock.send.mock.calls).toMatchSnapshot();
  });

  it('can add additional adaption via config', async () => {
    const validateAction = ({ count }, meta, { logger, next }) => {
      if (count) {
        logger.info('validation passed', meta);
        return next();
      }
      return next(Error('invalid input - count not found'));
    };

    const validateMiddleware = adaptorExpress({
      context: (req) => ({ logger: req.logger }),
    })(validateAction);

    const req = {
      contentType: 'json',
      meta: {
        requestId: '57cec994-ea1e-4555-81d6-45de628c3af9',
      },
      body: {
        count: 1,
      },
      logger: loggerMock,
    };

    await validateMiddleware(req, resMock, nextMock);

    expect(nextMock.mock.calls).toMatchSnapshot();
    expect(loggerMock.info.mock.calls).toMatchSnapshot();
  });

  it('chainable with hooks', async () => {
    const handlerAction = ({ count }, meta, { res }) => {
      res.send(count);
    };

    const adaptorExpressWithLogger = adaptorExpress({
      context: (req) => ({ logger: req.logger }),
    });
    const handler = adaptorExpressWithLogger(eventLogger()(handlerAction));

    const req = {
      contentType: 'json',
      meta: {
        requestId: '57cec994-ea1e-4555-81d6-45de628c3af9',
      },
      body: {
        count: 1,
      },
      logger: loggerMock,
    };

    await handler(req, resMock, nextMock);

    expect(resMock.send.mock.calls).toMatchSnapshot();
    expect(loggerMock.info.mock.calls).toMatchSnapshot();
  });
});
