/**
 * Express Async Router Wrapper
 * Eliminates redundant try/catch blocks in controllers by delegating errors to the next middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
