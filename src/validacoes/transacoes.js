const yup = require("yup");

let schema = yup.object().shape({
  descricao: yup.string().required(),
  valor: yup.number().required(),
  data: yup.date().required(),
  categoria_id: yup.number().required(),
  tipo: yup.string().required(),
});

module.exports = schema;
