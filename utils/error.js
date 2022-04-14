module.exports.errorResponse = (body, code, headers) => {
  return {
    statusCode: code || 500,
    headers: headers || { 'Content-Type': 'text/plain' },
    body,
  };
};
