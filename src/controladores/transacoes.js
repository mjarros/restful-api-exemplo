const conexao = require("../conexao");
const yup = require("../validacoes/transacoes");

const listarTransacoes = async (req, res) => {
  const { usuario } = req;

  try {
    const transacoes = await conexao
      .select([
        "transacoes.id",
        "transacoes.tipo",
        "transacoes.descricao",
        "transacoes.valor",
        "transacoes.data",
        "transacoes.usuario_id",
        "categorias.descricao as categoria_nome",
      ])
      .from("transacoes")
      .leftJoin("categorias", "transacoes.categoria_id", "categorias.id")
      .where("transacoes.usuario_id", usuario.id);

    return res.status(200).json(transacoes.reverse());
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const detalharTransacao = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;

  try {
    const transacaoId = await conexao("transacoes").where({ id });

    if (transacaoId.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Esta transação não existe no banco de dados." });
    }

    const transacaoUsuario = await conexao("transacoes").where({
      usuario_id: usuario.id,
    });

    if (transacaoUsuario.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Não existe transação para o usuário autenticado." });
    }

    const consulta = await conexao
      .select([
        "transacoes.id",
        "transacoes.tipo",
        "transacoes.descricao",
        "transacoes.valor",
        "transacoes.data",
        "transacoes.usuario_id",
        "categorias.descricao as categoria_nome",
      ])
      .from("transacoes")
      .leftJoin("categorias", "transacoes.categoria_id", "categorias.id")
      .where("transacoes.id", id)
      .where("transacoes.usuario_id", usuario.id)
      .first();

    if (!consulta) {
      return res.status(404).json({
        mensagem: "Esta transação não pertence ao usuário autenticado.",
      });
    }

    return res.status(200).json(consulta);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const cadastrarTransacao = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const { usuario } = req;

  try {
    await yup.validate(req.body);

    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({
        mensagem: `O campo 'tipo' aceita apenas os valores 'entrada' ou 'saida'.`,
      });
    }

    const consultaCategoria = await conexao("categorias").where({
      id: categoria_id,
    });

    if (consultaCategoria.length === 0) {
      return res.status(404).json({ mensagem: "Categoria não encontrada." });
    }

    const insercao = await conexao("transacoes")
      .insert({
        descricao,
        valor,
        data,
        categoria_id,
        usuario_id: usuario.id,
        tipo,
      })
      .returning("*");

    if (insercao.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possível cadastrar a transação." });
    }

    const consultaTransacao = await conexao
      .select([
        "transacoes.id",
        "transacoes.tipo",
        "transacoes.descricao",
        "transacoes.valor",
        "transacoes.data",
        "transacoes.usuario_id",
        "categorias.descricao as categoria_nome",
      ])
      .from("transacoes")
      .leftJoin("categorias", "transacoes.categoria_id", "categorias.id")
      .where("transacoes.id", insercao[0].id)
      .first();

    return res.status(200).json(consultaTransacao);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const atualizarTransacao = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const { usuario } = req;
  const { id: transacao_id } = req.params;

  try {
    await yup.validate(req.body);

    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({
        mensagem: `O campo 'tipo' aceita apenas os valores 'entrada' ou 'saida'.`,
      });
    }

    const consultaId = await conexao("transacoes").where({ id: transacao_id });

    if (consultaId.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Esta transação não existe no banco de dados." });
    }

    const consultaUsuario = await conexao("transacoes").where({
      id: transacao_id,
      usuario_id: usuario.id,
    });

    if (consultaUsuario.length === 0) {
      return res.status(404).json({
        mensagem: "Esta transação não pertence ao usuário autenticado.",
      });
    }

    const consultaCategoria = await conexao("categorias").where({
      id: categoria_id,
    });

    if (consultaCategoria.length === 0) {
      return res.status(404).json({ mensagem: "Categoria não encontrada." });
    }

    const atualizacao = await conexao("transacoes")
      .where({ id: transacao_id, usuario_id: usuario.id })
      .update({
        descricao,
        valor,
        data,
        categoria_id,
        tipo,
      });

    if (atualizacao === 0) {
      return res
        .status(404)
        .json({ mensagem: "Não foi possível atualizar a transação." });
    }

    return res.status(200).json();
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const excluirTransacao = async (req, res) => {
  const { usuario } = req;
  const { id: idTransacao } = req.params;

  try {
    const transacaoId = await conexao("transacoes").where({ id: idTransacao });

    if (transacaoId.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "Esta transação não existe no banco de dados." });
    }

    const transacaoUsuario = await conexao("transacoes").where({
      id: idTransacao,
      usuario_id: usuario.id,
    });

    if (transacaoUsuario === 0) {
      return res.status(404).json({
        mensagem: "Esta transação não pertence ao usuário autenticado.",
      });
    }

    const exclusao = await conexao("transacoes")
      .where({ id: idTransacao, usuario_id: usuario.id })
      .delete();

    if (exclusao === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possível excluir a transação." });
    }

    return res.status(200).json();
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const obterExtrato = async (req, res) => {
  const { usuario } = req;

  try {
    const entradas = await conexao
      .sum("valor as total")
      .from("transacoes")
      .where({ usuario_id: usuario.id })
      .where("tipo", "entrada")
      .first();

    let somaEntradas = 0;

    if (entradas.total !== null) {
      somaEntradas = Number.parseInt(entradas.total);
    }

    const saidas = await conexao
      .sum("valor as total")
      .from("transacoes")
      .where({ usuario_id: usuario.id })
      .where("tipo", "saida")
      .first();

    let somaSaidas = 0;
    if (saidas.total !== null) {
      somaSaidas = Number.parseInt(saidas.total);
    }

    const extrato = {
      entrada: somaEntradas,
      saida: somaSaidas,
    };

    return res.status(200).json(extrato);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  listarTransacoes,
  detalharTransacao,
  cadastrarTransacao,
  atualizarTransacao,
  excluirTransacao,
  obterExtrato,
};
