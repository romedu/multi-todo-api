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

const commonFolderValidators = [
   check("name", "Name must contain between 3 and 14 characters").isLength({ min: 3, max: 14 }),
   check("name", "Name must only contain only alphanumeric characters").isAlphanumeric(),
   check("description", "Description must be a string").isString().optional(),
   check("description", "Description must contain a maximum of 45 characters").isLength({ max: 45 }),
   check("image", "Image must be a string").isString().optional()
]

exports.createFolderValidators = [
   check("name", "Name is required").exists({ checkFalsy: true, checkNull: true }),
   check("name", "Name must be a string").isString(),
   ...commonFolderValidators
];

exports.updateFolderValidators = [
   check("name", "Name must be a string").isString().optional(),
   ...commonFolderValidators
];

const commonTodoListValidators = [
   check("name", "Name must contain between 3 and 14 characters").isLength({ min: 3, max: 14 }),
   check("name", "Name must only contain only alphanumeric characters").isAlphanumeric(),
   check("image", "Image must be a string").isString().optional()
];

exports.createTodoListValidators = [
   check("name", "Name is required").exists({ checkFalsy: true, checkNull: true }),
   check("name", "Name must be a string").isString(),
   ...commonTodoListValidators
];

exports.updateTodoListValidators = [
   check("name", "Name must be a string").isString().optional(),
   ...commonTodoListValidators
];

exports.createTodoValidators = [
   check("description", "Description is required").exists({ checkFalsy: true, checkNull: true }),
   check("description", "Description must be a string").isString(),
   check("checked", "Checked must be a boolean").isBoolean().optional()
];

exports.updateTodoValidators = [
   check("description", "Description must be a string").isString().optional(),
   check("checked", "Checked must be a boolean").isBoolean().optional()
];

module.exports = exports;