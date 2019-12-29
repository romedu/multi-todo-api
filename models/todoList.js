const mongoosePaginate = require("mongoose-paginate"),
      validator = require("../helpers/validator");

const mongoose = require("mongoose"),
      todoListSchema = new mongoose.Schema({
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
         folderName: {
            type: String,
            minlength: 3,
            maxlength: 14,
            default: undefined
         }, 
         todos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Todo"
         }],
         creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
         }
      },
      {timestamps: true});

todoListSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("TodoList", todoListSchema);