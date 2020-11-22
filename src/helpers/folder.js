const { Folder, TodoList } = require("../models");

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
		return next(error);
	}
};

exports.findOne = async (req, res, next) => {
	try {
		const { currentFolder } = req.locals,
			populatedFolder = await currentFolder.populate("files").execPopulate();

		return res.status(200).json(populatedFolder);
	} catch (error) {
		return next(error);
	}
};

exports.update = async (req, res, next) => {
	try {
		const options = {
				new: true,
				runValidators: true
			},
			updatedFolder = await Folder.findByIdAndUpdate(req.params.id, req.body, options);

		return res.status(200).json(updatedFolder);
	} catch (error) {
		return next(error);
	}
};

exports.delete = async (req, res, next) => {
	try {
		const { currentFolder } = req.locals,
			{ keep: keepFiles } = req.query;

		if (currentFolder.files.length && !keepFiles) await TodoList.deleteMany({ container: currentFolder._id });

		await currentFolder.delete();

		return res.status(200).json({ message: "Folder Removed Successfully" });
	} catch (error) {
		return next(error);
	}
};

module.exports = exports;
