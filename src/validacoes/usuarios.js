const yup = require("yup");

let schema = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  senha: yup.string().min(5).required(),
});

module.exports = schema;
