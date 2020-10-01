/**
 * sleep for n ms before resolving the Promise
 *
 * @param  {Number} time duration in ms
 * @returns {Promise} a Promise for async/await control flow
 */
const sleep = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });

export default sleep;
