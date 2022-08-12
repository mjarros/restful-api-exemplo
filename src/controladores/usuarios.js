const conexao = require("../conexao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const segredo = require("../segredo");
const yup = require("../validacoes/usuarios");
const enviarEmail = require("../email/enviarEmail");

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    await yup.validate(req.body);

    const consulta = await conexao("usuarios").where({ email });

    if (consulta.length > 0) {
      return res
        .status(400)
        .json({ mensagem: "Já existe usuário com o e-mail informado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const insercao = await conexao("usuarios").insert({
      nome,
      email,
      senha: senhaCriptografada,
    });

    if (insercao.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possível cadastrar o usuário." });
    }

    const novoUsuario = await conexao("usuarios").where({ email });

    const usuario = novoUsuario[0];

    const { senha: senhaUsuario, ...dadosUsuario } = usuario;

    enviarEmail(
      email,
      "Seja Bem-Vindo!",
      "Olá, seja bem vindo à esta aplicacao! Eventualmente estaremos enviando notícias sobre nossos produtos e promocoes! Até log! Equipe..."
    );
    return res.status(200).json(dadosUsuario);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const efetuarLogin = async (req, res) => {
  const { email, senha } = req.body;

  try {
    await yup.validate(req.body);

    const queryConsultaEmail = await conexao("usuarios").where({ email });

    if (queryConsultaEmail.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const usuario = queryConsultaEmail[0];

    const senhaVerificada = await bcrypt.compare(senha, usuario.senha);

    if (!senhaVerificada) {
      return res
        .status(401)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const token = jwt.sign({ id: usuario.id }, segredo, { expiresIn: "8h" });

    const { senha: senhaUsuario, ...dadosUsuario } = usuario;

    enviarEmail(
      email,
      "Login Efetuado",
      "Você efetuou um login com este e-mail na nossa plataforma de servicos. Att., Equipe..."
    );

    return res.status(200).json({
      usuario: dadosUsuario,
      token,
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const detalharPerfilUsuario = async (req, res) => {
  const { usuario } = req;

  try {
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const atualizarPerfilUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;
  const { usuario } = req;

  try {
    await yup.validate(req.body);

    const consulta = await conexao("usuarios").where({ id: usuario.id, email });

    if (consulta.length > 0) {
      return res.status(400).json({
        mensagem:
          "O e-mail informado já está sendo utilizado por outro usuário.",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const update = await conexao("usuarios")
      .where({ id: usuario.id })
      .update({ nome, email, senha: senhaCriptografada });

    if (update.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possível atualizar o usuário." });
    }

    return res.status(200).json();
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  cadastrarUsuario,
  efetuarLogin,
  detalharPerfilUsuario,
  atualizarPerfilUsuario,
};
