const { Folder, TodoList } = require("../models"),
	{ errorHandler } = require("./error");

exports.find = async (req, res, next) => {
	try {
		const { user } = req.locals,
			{ page, limit, sortProp, sortOrder } = req.query,
			searchArg = { creator: user.id },
			defaultLimit = 20,
			options = {
				sort: { [sortProp]: sortOrder },
				page,
				limit: Number(limit) < defaultLimit ? Number(limit) : defaultLimit
			},
			foundFolders = await Folder.paginate(searchArg, options);

		return res.status(200).json(foundFolders);
	} catch (error) {
		return next(error);
	}
};

exports.create = async (req, res, next) => {
	try {
		const { user } = req.locals,
			newFolderData = {
				...req.body,
				creator: user.id
			},
			newFolder = await Folder.create(newFolderData);

		return res.status(201).json(newFolder);
	} catch (error) {
		if (error.code === 11000) {
			error = errorHandler(
				409,
				"That name is not avaibale, please try another one"
			);
		}

		return next(error);
	}
};

//Check if owner or admin
exports.findOne = async (req, res, next) => {
	try {
		const { currentFolder, creator } = req.locals,
			populatedFolder = await currentFolder.populate("files").execPopulate();

		return res
			.status(200)
			.json({ ...populatedFolder._doc, creator: creator.id });
	} catch (error) {
		return next(error);
	}
};

//Only the owner or admins for non admin creators
exports.update = async (req, res, next) => {
	try {
		const { currentFolder, creator } = req.locals,
			options = {
				runValidators: true
			},
			populatedFolder = await currentFolder.populate("files").execPopulate(),
			updatedFolder = { ...populatedFolder._doc, ...req.body },
			{ name: newFolderName } = req.body;

		// Update the folder
		await populatedFolder.updateOne(req.body, options);

		if (newFolderName && updatedFolder.files.length) {
			updatedFolder.files.forEach(async file => {
				file.folderName = newFolderName;
				await file.save();
			});
		}

		return res.status(200).json({ ...updatedFolder, creator: creator.id });
	} catch (error) {
		if (error.code === 11000) {
			error = errorHandler(
				409,
				"That name is not avaibale, please try another one"
			);
		}

		return next(error);
	}
};

//Only the owner or admins for non admin creators
exports.delete = async (req, res, next) => {
	try {
		const { currentFolder } = req.locals,
			populatedFolder = await currentFolder.populate("files").execPopulate(),
			{ files: folderFiles, name: folderName } = populatedFolder,
			{ keep: keepFiles } = req.query;

		await currentFolder.delete();

		if (folderFiles.length) {
			if (keepFiles) {
				await TodoList.updateMany(
					{ folderName: folderName },
					{ folderName: null }
				);
			} else await TodoList.deleteMany({ folderName: folderName });
		}

		return res.status(200).json({ message: "Folder Removed Successfully" });
	} catch (error) {
		return next(error);
	}
};

module.exports = exports;
