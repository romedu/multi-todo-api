if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "ci") require("dotenv").config();

const express = require("express"),
   app = express(),
   cors = require("cors"),
   morgan = require("morgan"),
   bodyParser = require("body-parser"),
   {
      authRoutes,
      folderRoutes,
      todoListRoutes,
      todoRoutes,
      servicesRoutes
   } = require("./routes"),
   { checkIfToken, serializeBody, todos } = require("./middlewares"),
   { errorHandler } = require("./helpers/error"),
   isTestingEnv = process.env.NODE_ENV === "test";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ urlencoded: true }));
app.use(serializeBody);
if (!isTestingEnv) app.use(morgan("tiny"));

app.use("/api/auth", authRoutes);
app.use(
   "/api/todos/:id/todo",
   checkIfToken,
   todos.getCurrentList,
   todos.checkPermission,
   todoRoutes
);
app.use("/api/todos", checkIfToken, todoListRoutes);
app.use("/api/folder", checkIfToken, folderRoutes);
app.use("/api/services", checkIfToken, servicesRoutes);
app.get("*", (req, res, next) => {
   const notFoundError = errorHandler(404, "Route not found")
   next(notFoundError);
});

app.use((error, req, res, next) => {
   let errorResponse;

   if (!isTestingEnv) console.error(error);
   if (!error.status) error = errorHandler();
   errorResponse = { message: error.message };

   return res.status(error.status).json(errorResponse);
});

module.exports = app;
