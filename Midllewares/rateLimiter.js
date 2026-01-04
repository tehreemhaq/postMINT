const rateLimit = require('express-rate-limit')


const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,               // limit each IP
  handler: (req, res) => {
    // Custom response
    res.status(429).json({
      status: 'error',
      message: ' You hit the request limit. Try again in a minute.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) + 's'
    });
  }
});


module.exports = {
    limiter
}