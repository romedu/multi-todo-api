const http = require("http");

exports.validateHttpStatusCode = statusCode => !!http.STATUS_CODES[statusCode];