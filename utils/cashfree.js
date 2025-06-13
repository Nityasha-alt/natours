const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX, // use CFEnvironment.PRODUCTION for prod
  process.env.CASHFREE_CLIENT_ID,
  process.env.CASHFREE_CLIENT_SECRET,
);

module.exports = cashfree;
