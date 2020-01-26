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

		if (!foundFolder) throw errorHandler(404, "Not Found");
		req.locals.currentFolder = foundFolder;
		next();
	} catch (error) {
		next(error);
	}
};

// Populate the currentFolder's creator property, check if the current user is the folder owner or an admin,
// and pass in the creator property in the req.locals object
const checkPermission = async (req, res, next) => {
	try {
		const { currentFolder, user } = req.locals,
			populatedFolder = await currentFolder
				.populate("creator")
				.execPopulate(),
			{ creator } = populatedFolder,
			{ isAdmin, id: userId } = user;

		if (!isAdmin && creator.id !== userId) {
			throw errorHandler(401, "You are not authorized");
		}
		req.locals.creator = creator;
		return next();
	} catch (error) {
		next(error);
	}
};

// If the current folder creator is an admin only him can proceed
const ownerPrivileges = (req, res, next) => {
	const { user, creator } = req.locals;

	if (!creator.isAdmin || creator.id === user.id) return next();
	return next(errorHandler(401, "You are not authorized to proceed"));
};

exports.postMiddlewares = [createFolderValidators, confirmValidation];
exports.idCommonMiddlewares = [getCurrentFolder, checkPermission];
exports.idPatchMiddlewares = [updateFolderValidators, confirmValidation];
exports.idDeleteMiddlewares = [ownerPrivileges];

module.exports = exports;
