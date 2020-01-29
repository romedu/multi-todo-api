const { Folder } = require("../models"),
	{ errorHandler } = require("../helpers/error"),
	{
		createFolderValidators,
		updateFolderValidators,
		confirmValidation
	} = require("../helpers/validator");

// Find the current folder using the id parameter and pass it in the req.locals object as currentFolder
const getCurrentFolder = async (req, res, next) => {
	try {
		const foundFolder = await Folder.findById(req.params.id);

		if (foundFolder) {
			req.locals.currentFolder = foundFolder;
			return next();
		} else throw errorHandler(404, "Not Found");
	} catch (error) {
		next(error);
	}
};

// Check if the current user is the folder owner
const checkPermission = async (req, res, next) => {
	try {
		const { currentFolder, user } = req.locals,
			isUserAuthorized = `${currentFolder.creator}` === `${user.id}`;

		if (isUserAuthorized) return next();
		else throw errorHandler(401, "You are not authorized to proceed");
	} catch (error) {
		next(error);
	}
};

exports.postMiddlewares = [createFolderValidators, confirmValidation];
exports.idCommonMiddlewares = [getCurrentFolder, checkPermission];
exports.idPatchMiddlewares = [updateFolderValidators, confirmValidation];

module.exports = exports;
