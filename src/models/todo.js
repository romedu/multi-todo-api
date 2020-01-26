const mongoose = require("mongoose"),
	todoSchema = new mongoose.Schema(
		{
			description: {
				type: String,
				required: true,
				minlength: 1
			},
			checked: {
				type: Boolean,
				default: false
			},
			container: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "TodoList"
			}
		},
		{ timestamps: true }
	);

module.exports = mongoose.model("Todo", todoSchema);
