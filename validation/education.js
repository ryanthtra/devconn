const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  // In case name is completely blank (thus, technically not an empty string)
  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.studyfield = !isEmpty(data.studyfield) ? data.studyfield : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (validator.isEmpty(data.school)) {
    errors.school = "School field is required!";
  }
  if (validator.isEmpty(data.degree)) {
    errors.degree = "degree field is required!";
  }
  if (validator.isEmpty(data.studyfield)) {
    errors.studyfield = "Study field is required!";
  }
  if (validator.isEmpty(data.from)) {
    errors.from = "From date field is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
