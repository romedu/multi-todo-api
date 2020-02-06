const mongoosePaginate = require("mongoose-paginate"),
	validator = require("../helpers/validator");

const mongoose = require("mongoose"),
	todoListSchema = new mongoose.Schema(
		{
			name: {
				type: String,
				required: [true, "Name is required"],
				minlength: [3, "Only between 3 and 14 characters are allowed"],
				maxlength: [14, "Only between 3 and 14 characters are allowed"],
				validate: {
					validator: validator.alphanumOnly,
					message: "Only alphanumeric and space characters are allowed"
				}
			},
			image: String,
			container: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Folder"
			},
			todos: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Todo"
				}
			],
			creator: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User"
			}
		},
		{ timestamps: true }
	);

todoListSchema.plugin(mongoosePaginate);

todoListSchema.methods.pullListFromContainer = async function() {
	try {
		if (this.container) {
			await this.populate("container").execPopulate();
			this.container.files.pull(this._id);
			await this.container.save();
			this.depopulate("container");
		}
	} catch (error) {
		throw error;
	}
};

module.exports = mongoose.model("TodoList", todoListSchema);
