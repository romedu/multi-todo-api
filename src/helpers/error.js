const { STATUS_CODES } = require("http"),
   { validateHttpStatusCode } = require("../utils");

exports.errorHandler = (status = 500, message) => {
   const isStatusCodeValid = validateHttpStatusCode(status),
      errorStatus = isStatusCodeValid ? status : 500,
      errorMessage = message || STATUS_CODES[errorStatus],
      error = new Error(errorMessage);

   error.status = errorStatus;
   return error;
} 