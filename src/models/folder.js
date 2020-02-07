const mongoosePaginate = require("mongoose-paginate"),
	validator = require("../validators");

const mongoose = require("mongoose"),
	folderSchema = new mongoose.Schema(
		{
			name: {
				type: String,
				required: [true, "Name is required"],
				minlength: [2, "Only between 2 and 25 characters are allowed"],
				maxlength: [25, "Only between 2 and 25 characters are allowed"],
				validate: {
					validator: validator.alphanumOnly,
					message: "Only alphanumeric and space characters are allowed"
				}
			},
			description: {
				type: String,
				maxlength: [100, "The maximun number of characters allowed is 100"]
			},
			image: String,
			files: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "TodoList"
				}
			],
			creator: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User"
			}
		},
		{ timestamps: true }
	);

folderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Folder", folderSchema);
