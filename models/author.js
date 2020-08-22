const mongoose = require("mongoose");
const moment = require("moment");

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

AuthorSchema.virtual("name").get(function () {
  return this.first_name && this.family_name
    ? this.family_name + ", " + this.first_name
    : "";
});

//VIRTUAL FOR AUTHORS DOB
AuthorSchema.virtual("date_of_birth_formatted").get(function () {
  return this.date_of_birth
    ? moment.utc(this.date_of_birth).format("Do MMMM YYYY")
    : "Unknown";
});

//VIRTUAL FOR AUTHORS DOD
AuthorSchema.virtual("date_of_death_formatted").get(function () {
  return this.date_of_death
    ? moment.utc(this.date_of_death).format("Do MMMM YYYY")
    : "";
});

//VIRTUAL FOR AUTHORS LIFESPAN
AuthorSchema.virtual("lifespan").get(function () {
  let lifespan = "";
  this.date_of_birth
    ? (lifespan = this.date_of_birth_formatted)
    : (lifespan = "");
  lifespan += " - ";
  this.date_of_death
    ? (lifespan += this.date_of_death_formatted)
    : (lifespan += "current");

  return lifespan;
});

//VIRTUAL FOR AUTHORS URL
AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

module.exports = mongoose.model("Author", AuthorSchema);
