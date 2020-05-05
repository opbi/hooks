import example from 'index';

import * as constants from 'constants';

jest.mock('constants');

describe('example', () => {
  it('works', () => {
    const result = example();
    expect(result).toBe('hello world');
  });

  it('would fail if constant types corrupt', () => {
    constants.FOO = 1;
    constants.BAR = 'foo';
    expect(example).toThrowErrorMatchingSnapshot();
  });
});
