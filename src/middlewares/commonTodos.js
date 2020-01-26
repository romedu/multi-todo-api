const { TodoList, Folder } = require("../models"),
	{ errorHandler } = require("../helpers/error");

exports.getCurrentList = async (req, res, next) => {
	try {
		const foundList = await TodoList.findById(req.params.id);

		if (!foundList) throw errorHandler(404, "Not Found");
		req.locals.currentList = foundList;
		next();
	} catch (error) {
		return next(error);
	}
};

// Validates that the currentUser is either an admin or the currentList owner
exports.checkPermission = async (req, res, next) => {
	try {
		const { user, currentList } = req.locals;

		let isUserOwner, isUserAuthorized;

		await currentList.populate("creator").execPopulate();

		isUserOwner =
			`${currentList.creator && currentList.creator._id}` === `${user.id}`;
		isUserAuthorized = user.isAdmin || isUserOwner;

		if (isUserAuthorized) req.locals.creator = currentList.creator._id;
		else throw errorHandler(401, "You are not authorized");

		return next();
	} catch (error) {
		return next(error);
	}
};

// If the current list creator is an admin only him can proceed
exports.ownerPrivileges = (req, res, next) => {
	const { user, creator } = req.locals;

	if (!creator.isAdmin || creator.id === user.id) {
		return next();
	}
	return next(errorHandler(401, "You are not authorized to proceed"));
};

exports.ownerOnly = (req, res, next) => {
	const { user, creator } = req.locals,
		isUserOwner = `${creator}` === `${user.id}`;

	if (isUserOwner) return next();
	return next(errorHandler(401, "You are not authorized to proceed"));
};

// If the list is going to be inside of a folder check if the current user is it's owner
exports.checkIfFolderOwner = async (req, res, next) => {
	try {
		const { body, locals } = req,
			{ user } = locals;

		if (!body.folderName || body.folderName === "-- No Folder --")
			return next();

		const currentListFolder = await Folder.findOne({ name: body.folderName })
			.populate("creator")
			.exec();

		if (!currentListFolder) throw errorHandler(404, "Not Found");
		else {
			const isUserFolderOwner =
				`${currentListFolder.creator.id}` === `${user.id}`;

			if (!isUserFolderOwner)
				throw errorHandler(401, "You are not authorized to proceed");
			else req.locals.currentListFolder = currentListFolder;
		}

		return next();
	} catch (error) {
		next(error);
	}
};

module.exports = exports;
