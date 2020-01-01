const { STATUS_CODES } = require("http");

exports.errorHandler = (status = 500, message) => {
   const errorMessage = message || STATUS_CODES[status],
      error = new Error(errorMessage);

   error.status = status;
   return error;
} 