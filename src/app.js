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
   { NODE_ENV } = process.env;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ urlencoded: true }));
app.use(serializeBody);
app.use(morgan("tiny"));

app.use("/api/auth", authRoutes);
app.use("/api", checkIfToken);
app.use(
   "/api/todos/:id/todo",
   todos.getCurrentList,
   todos.checkPermission,
   todoRoutes
);
app.use("/api/todos", todoListRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/services", servicesRoutes);
app.get("*", (req, res, next) => {
   const notFoundError = errorHandler(404, "Route not found")
   next(notFoundError);
});

app.use((error, req, res, next) => {
   let errorResponse;

   console.error(errorResponse);
   if (!error.status) error = errorHandler();
   errorResponse = { message: error.message };

   return res.status(error.status).json(errorResponse);
});

module.exports = app;
