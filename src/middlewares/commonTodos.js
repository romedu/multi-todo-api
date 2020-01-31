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

exports.checkPermission = async (req, res, next) => {
	try {
		const { user, currentList } = req.locals,
			isUserAuthorized = `${currentList.creator}` === `${user.id}`;

		if (isUserAuthorized) return next();
		else throw errorHandler(401, "You are not authorized");
	} catch (error) {
		return next(error);
	}
};

// If the list is going to be inside of a folder check if the current user is it's owner
exports.checkIfFolderOwner = async (req, res, next) => {
	try {
		const { body, locals } = req,
			{ user } = locals;

		if (body.folderName && body.folderName !== "-- No Folder --") {
			const currentListFolder = await Folder.findOne({
				name: body.folderName
			});

			if (!currentListFolder) throw errorHandler(404, "Not Found");
			else {
				const isUserFolderOwner =
					`${currentListFolder.creator}` === `${user.id}`;

				if (isUserFolderOwner) locals.currentListFolder = currentListFolder;
				else throw errorHandler(401, "You are not authorized to proceed");
			}
		}

		return next();
	} catch (error) {
		next(error);
	}
};

module.exports = exports;
