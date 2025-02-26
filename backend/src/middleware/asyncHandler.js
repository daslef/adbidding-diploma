/**
 * Async handler middleware to avoid try/catch in controllers
 * @param {Function} fn - The async controller function
 * @returns {Function} Express middleware
 */
exports.asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };