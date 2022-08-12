const knex = require("knex");

const conexao = knex({
  client: "pg",
  connection: {
    user: process.env.CONEXAO_USER,
    host: process.env.CONEXAO_HOST,
    database: process.env.CONEXAO_DATABASE,
    password: process.env.CONEXAO_PASSWORD,
    port: process.env.CONEXAO_PORT,
  },
});

module.exports = conexao;
