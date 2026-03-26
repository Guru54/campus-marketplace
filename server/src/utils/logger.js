// Environment-aware logger: suppresses non-error logs in production
const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  error: (...args) => console.error(...args),
};

module.exports = logger;
