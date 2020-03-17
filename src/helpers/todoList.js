const fs = require("fs"),
	os = require("os"),
	path = require("path"),
	{ promisify } = require("util"),
	{ TodoList, Todo } = require("../models"),
	{ createTodoListTemplate } = require("../templates/todoList"),
	fsMkdtempPromise = promisify(fs.mkdtemp),
	fsWriteFilePromise = promisify(fs.writeFile);

// Finds either all the todoLists or the ones in a specific folder
exports.find = async (req, res, next) => {
	try {
		const { user } = req.locals,
			{ page, limit, sortProp, sortOrder, folderLess } = req.query,
			searchArg = { creator: user.id },
			defaultLimit = 20,
			options = {
				sort: { [sortProp]: sortOrder },
				page,
				limit: Number(limit) < defaultLimit ? Number(limit) : defaultLimit
			};

		let foundLists;

		// This is used to find all the todoList that are not inisde of a folder
		if (folderLess) searchArg.container = undefined;

		foundLists = await TodoList.paginate(searchArg, options);
		return res.status(200).json(foundLists);
	} catch (error) {
		next(error);
	}
};

exports.create = async (req, res, next) => {
	try {
		const { listNewFolder, user } = req.locals,
			newTodoListData = {
				...req.body,
				creator: user.id
			},
			newTodoList = await TodoList.create(newTodoListData);

		// If the newList is inside of a folder, add it to that folder
		if (listNewFolder) {
			listNewFolder.files.push(newTodoList.id);
			await listNewFolder.save();
		}

		return res.status(201).json(newTodoList);
	} catch (error) {
		next(error);
	}
};

exports.findOne = async (req, res, next) => {
	try {
		const { currentList } = req.locals;

		await currentList.populate("todos").execPopulate();
		return res.status(200).json(currentList);
	} catch (error) {
		return next(error);
	}
};

exports.update = async (req, res, next) => {
	try {
		const { currentList, listNewFolder } = req.locals,
			options = {
				new: true,
				runValidators: true,
				omitUndefined: false
			};

		let updatedList;

		if (listNewFolder) {
			await currentList.pullListFromContainer();
			listNewFolder.files.push(currentList._id);
			await listNewFolder.save();
		}

		updatedList = await TodoList.findByIdAndUpdate(currentList._id, req.body, options);
		return res.status(200).json(updatedList);
	} catch (error) {
		return next(error);
	}
};

exports.delete = async (req, res, next) => {
	try {
		const { currentList } = req.locals;

		// Delete all of the todos from the list
		await Todo.deleteMany({ container: currentList._id });
		await currentList.delete();

		return res.status(200).json({ message: "Todo List Removed Successfully" });
	} catch (error) {
		next(error);
	}
};

// The file will contain the description of all of the todos in the list separated by a new line
exports.downloadFile = async (req, res, next) => {
	try {
		const { currentList } = req.locals,
			tempDirPath = os.tmpdir(),
			tempFolderPath = await fsMkdtempPromise(`${tempDirPath}${path.sep}`),
			tempFilePath = `${tempFolderPath}${path.sep}todo-download.txt`;

		let fileContent;

		await currentList.populate(["todos", "container"]).execPopulate();
		fileContent = createTodoListTemplate(currentList);
		await fsWriteFilePromise(tempFilePath, fileContent);

		return res.download(tempFilePath);
	} catch (error) {
		return next(error);
	}
};

module.exports = exports;
