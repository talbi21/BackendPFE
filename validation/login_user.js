const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateLoginUserInput(data) {
  let errors = {};

// Convert empty fields to an empty string so we can use validator functions
  data.identifiant = !isEmpty(data.identifiant) ? data.identifiant : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  
// identifiant checks
  if (Validator.isEmpty(data.identifiant)) {
    errors.identifiant = "Ce champ est obligatoire";
  } 
// Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Ce champ est obligatoire";
  }

return {
    errors,
    isValid: isEmpty(errors)
  };
}