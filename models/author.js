const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

//VIRTUAL FOR AUTHORS FULL NAME
// To avoid errors in cases where an author does not have either a family name or first name
// We want to make sure we handle the exception by returning an empty string for that case

AuthorSchema.virtual("name").get(() => {
  let fullname = "";

  this.first_name && this.family_name
    ? (fullname = this.family_name + ", " + this.first_name)
    : (fullname = "");

  return fullname;
});

//VIRTUAL FOR AUHORS LIFESPAN
AuthorSchema.virtual("lifespan").get(() =>
  (this.date_of_death.getYear() = this.date_of_birth.getYear()).toString()
);

//VIRTUAL FOR AUTHORS URL
AuthorSchema.virtual("url").get(() => "/catalog/author/" + this._id);

module.exports = mongoose.model("Author", AuthorSchema);
