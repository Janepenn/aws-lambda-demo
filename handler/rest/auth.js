const jwt = require('jsonwebtoken');

const crypto = require('../../utils/crypto');
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports.handler = (event, context, callback) => {
  if (
    event.authorizationToken &&
    event.authorizationToken.split(' ').length === 2 &&
    event.authorizationToken.split(' ')[0] === 'Bearer'
  ) {
    try {
      const token = event.authorizationToken.split(' ')[1];
      const decoded = jwt.verify(token, PRIVATE_KEY);
      const response = crypto.generatePolicy(
        decoded.username,
        'Allow',
        event.methodArn
      );
      return callback(null, response);
    } catch (error) {
      // jwt verification failed
      return callback('Unauthorized');
    }
  } else {
    return callback('Unauthorized');
  }
};
