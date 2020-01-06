const { check, validationResult } = require('express-validator');

exports.alphanumOnly = data => /^[a-z\d\-_\s]+$/i.test(data);

exports.confirmValidation = (req, res, next) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      const errorsArray = errors.array(),
         errorMessages = errorsArray.map(error => error.msg);

      return res.status(422).json({ errors: errorMessages });
   }

   return next();
}

exports.userValidators = [
   check("username", "Username is required").exists({ checkFalsy: true, checkNull: true }),
   check("username", "Username must be a string").isString(),
   check("username", "Username must contain between 4 and 20 characters").isLength({ min: 4, max: 20 }),
   check("username", "Username must only contain only alphanumeric characters").isAlphanumeric(),
   check("password", "Password is required").exists({ checkFalsy: true, checkNull: true }),
   check("password", "Password must be a string").isString(),
   check("password", "Password must contain between 8 and 24 characters").isLength({ min: 8, max: 24 }),
];

module.exports = exports;