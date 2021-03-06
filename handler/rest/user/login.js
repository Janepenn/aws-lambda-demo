const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { errorResponse } = require('../../../utils/error');
const crypto = require('../../../utils/crypto');

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports.handler = (event, context, callback) => {
  const { queryStringParameters } = event;
  const username = queryStringParameters && queryStringParameters.username;
  const password = queryStringParameters && queryStringParameters.password;
  if (
    typeof username === 'string' &&
    typeof password === 'string' &&
    username.length > 0 &&
    password.length > 0
  ) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        username,
      },
    };

    dynamoDb.get(params, (error, data) => {
      if (error) {
        console.error(error);
        callback(null, errorResponse('Cannot login!'));
        return;
      }

      const user = data.Item;
      // validate username & password
      if (user && crypto.validatePassword(password, user.salt, user.password)) {
        const response = {
          statusCode: 200,
          body: JSON.stringify({
            username: user.username,
            // return jwt
            token: jwt.sign(
              {
                username: user.username,
              },
              PRIVATE_KEY,
              { expiresIn: '30s' }
            ),
          }),
        };
        callback(null, response);
      } else {
        callback(null, errorResponse('Invalid username or password!', 401));
      }
    });
  } else {
    callback(null, errorResponse('Params are invalid!', 422));
  }
};
