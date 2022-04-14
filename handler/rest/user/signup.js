const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { errorResponse } = require('../../../utils/error');
const crypto = require('../../../utils/crypto');

const TABLE_NAME = process.env.DYNAMODB_TABLE;

module.exports.handler = (event, context, callback) => {
  const { body } = event;
  const data = body ? JSON.parse(body) : {};
  const { username, password } = data;
  if (
    typeof username === 'string' &&
    typeof password === 'string' &&
    username.length > 0 &&
    password.length > 0
  ) {
    const timestamp = new Date().getTime();

    // one-way hashed password
    const { salt, hashedPassword } = crypto.genHashedPassword(password);

    const params = {
      TableName: TABLE_NAME,
      Item: {
        username,
        salt,
        password: hashedPassword,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };
    // write the user to the database
    dynamoDb.put(params, (error) => {
      // handle errors
      if (error) {
        console.error(error);
        callback(
          null,
          errorResponse('Cannot create the user!', error.statusCode || 501)
        );
        return;
      }

      // success response
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'success',
        }),
      };
      callback(null, response);
    });
  } else {
    callback(null, errorResponse('Params are invalid!', 422));
  }
};
