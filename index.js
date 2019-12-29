if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require("express"),
	app = express(),
	cors = require("cors"),
	morgan = require("morgan"),
	bodyParser = require("body-parser"),
	{ PORT } = process.env,
	{
		authRoutes,
		folderRoutes,
		todoListRoutes,
		todoRoutes,
		servicesRoutes
	} = require("./routes"),
	{ checkIfToken, serializeBody, todos } = require("./middlewares"),
	{ errorHandler } = require("./helpers/error");

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
app.get("*", (req, res, next) => next(errorHandler(404, "Route not found")));

app.use((error, req, res, next) => {
	const { status, message } = error,
		errorResponse = { status, message };

	if (!status) {
		errorResponse.status = 500;
		errorResponse.message = "Internal Server Error";
	}

	console.error(errorResponse);
	return res.json(errorResponse);
});

app.listen(PORT, () => {
	console.log(`Todos r' Up in port: ${PORT}`);
});
