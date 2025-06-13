const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cashfree = new Cashfree(
  CFEnvironment.PRODUCTION,
  process.env.CASHFREE_CLIENT_ID,
  process.env.CASHFREE_CLIENT_SECRET,
);

module.exports = cashfree;
