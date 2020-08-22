const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true }, //REFRENCE TO ASSOCIATED BOOK
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

// VIRTUAL FOR BOOKINSTANCES URL
BookInstanceSchema.virtual("url").get(function () {
  return "/catalog/bookinstance/" + this._id;
});

// VIRTUAL TO FORMAT DUE BACK DATE
BookInstanceSchema.virtual("due_back_formatted").get(function () {
  return moment.utc(this.due_back).format("DD-MM-YYYY");
});

module.exports = mongoose.model("BookInstance", BookInstanceSchema);
