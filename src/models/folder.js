const mongoosePaginate = require("mongoose-paginate"),
   validator = require("../helpers/validator");

const mongoose = require("mongoose"),
   folderSchema = new mongoose.Schema(
      {
         name: {
            type: String,
            unique: true,
            required: [true, "Name is required"],
            minlength: [3, "Only between 3 and 14 characters are allowed"],
            maxlength: [14, "Only between 3 and 14 characters are allowed"],
            validate: {
               validator: validator.alphanumOnly,
               message: "Only alphanumeric and space characters are allowed"
            }
         },
         description: {
            type: String,
            maxlength: [45, "The maximun number of characters allowed is 45"]
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