const progressAdd = (valueFunction) => (action) => async (
  param,
  meta = {},
  context = {},
) => {
  const { progress } = context;
  if (!progress) return action(param, meta, context);

  const value = valueFunction ? valueFunction(param, meta, context) : 1;
  progress.add(value);

  return action(param, meta, context);
};

export default progressAdd;
