import moment from 'moment';

// usage with batch on stream:
// normally progress would add value from readStream
// especially when record needs to pass through filter to get to write stream
// batch would be on the write stream side, and update progress after batchWrite
//
// resume a progress on stream:
// notice that readstream is a buffer ahead of writestream
// it is necessary to rewind the position of the buffer size
// to resume at the accurate point

// position: after progress-add
// percentage in the meta should reflect the actual progress
// as progress.add would have sync to the moment the write function is triggered
//
// position: before/above progress-add
// percentage in the meta is one batch behind the actual progress
// as it is profiled before the function execution
// it is not possible to pass the updated progress before inputFunction call
// it is not recommended to position this decorator at this location

const jobProgress = (action) => async (param, meta = {}, context = {}) => {
  const { job, progress } = context;

  if (!job || !progress) return action(param, meta, context);

  // a specific log plugin can be created if multi-level log is needed
  const { formattedPercentage: percentage } = progress;
  const timeToFinish = moment.utc(progress.etf).format('HH:mm:ss');
  const { position } = progress;

  const result = await action(
    param,
    { ...meta, progress: percentage },
    context,
  );

  job.update({ ...job.data, position, timeToFinish });
  job.progress(percentage);

  return result;
};

export default jobProgress;
