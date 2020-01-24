const jwt = require("jsonwebtoken"),
   { User } = require("../models"),
   { errorHandler } = require("./error");

exports.register = async (req, res, next) => {
   try {
      const user = await User.create(req.body),
         signedUserData = signUser(user);
      return res.status(200).json(signedUserData);
   } catch (error) {
      if (error.code === 11000)
         error = errorHandler(409, "Username is not available");
      return next(error);
   }
};

exports.login = async (req, res, next) => {
   try {
      const { username, password } = req.body,
         user = await User.findOne({ username });

      if (!user || !password)
         throw errorHandler(401, "Incorrect Username/Password");

      const passwordComparison = await user.comparePassword(password);

      if (passwordComparison === true) {
         const signedUserData = signUser(user);
         return res.status(200).json(signedUserData);
      } else throw errorHandler(401, "Incorrect Username/Password");
   } catch (error) {
      return next(error);
   }
};

// MiddleWare should check if token
exports.verifyToken = (req, res) => {
   const { user } = req.locals;
   return res.status(200).json(user);
};

const signUser = user => {
   const { username, isAdmin, id } = user,
      { SECRET, ALGORITHM } = process.env,
      token = jwt.sign({ username, isAdmin, id }, SECRET, {
         expiresIn: "1h",
         algorithm: ALGORITHM
      }),
      userData = {
         username,
         isAdmin,
         token,
         id,
         tokenExp: Date.now() + 3600 * 1000
      };

   return userData;
};
