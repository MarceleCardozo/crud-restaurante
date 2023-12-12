import express from "express";
const cors = require("cors");

//Geração de id's
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());
app.use(cors());

const pratos = [
  {
    id: "3d886798-b947-47f1-9776-104c116227e5",
    nome: "Frango Grelhado",
    descricao: "Peito de frango grelhado com temperos frescos",
    preco: 15.99,
  },
  {
    id: "3d886798-b947-47f1-9776-104c116227e6",
    nome: "Massa Carbonara",
    descricao: "Massa italiana com molho carbonara cremoso",
    preco: 18.5,
  },
  {
    id: "3d886798-b947-47f1-9776-104c116227e8",
    nome: "Sushi Misto",
    descricao: "Seleção de sushis variados, incluindo sashimi e rolos",
    preco: 22.75,
  },
];

const usuarios = [
  {
    id: "5c7b7f88-961c-11ee-b9d1-0242ac120002",
    nome: "João da Silva",
    email: "joao@mail.com",
    senha: "temp123",
  },
];

//AUTENTICAÇÃO

const autenticaUsuario = function (request, response, next) {
  let id = request.headers.authorization;

  if (id.includes("Bearer")) {
    id = id.split(" ")[1];
  }

  const existeNaLista = usuarios.find((usuario) => usuario.id === id);

  if (!existeNaLista)
    return response.status(403).json("Usuário não autorizado");

  //caso de sucesso passa a executar a rota
  next();
};

//LOGIN
app.post("/usuarios/login", (request, response) => {
  const body = request.body;
  console.log(body);

  if (!body.email) return response.status(400).json("Email não informado");

  if (!body.senha) return response.status(400).json("Senha não informada");

  const pegaUsuario = usuarios.find(
    (usuario) => usuario.email === body.email && usuario.senha === body.senha
  );

  if (!pegaUsuario) return response.status(401).json("Credenciais inválidas");

  return response.status(201).json({ usuarioId: pegaUsuario.id });
});

//BUSCA USUARIOS
app.get("/usuarios", (request, response) => {
  return response.json(usuarios);
});

//CRIA USUARIO
app.post("/usuarios", (request, response) => {
  const body = request.body;

  if (!body.nome) return response.status(400).json("Nome não informado");

  if (!body.email) return response.status(400).json("Email não informado");

  if (!body.senha) return response.status(400).json("Senha não informada");

  const existeUsuario = usuarios.find(
    (usuario) => usuario.email === body.email
  );

  if (existeUsuario) return response.status(400).json("E-mail já cadastrado");

  const novoUsuario = {
    id: uuidv4(),
    nome: body.nome,
    email: body.email,
    senha: body.senha,
  };

  usuarios.push(novoUsuario);

  return response.json(usuarios);
});

//BUSCA PRATOS
app.get("/pratos", (request, response) => {
  if (request.query.nome) {
    const filtroPrato = pratos.find(
      (prato) =>
        prato.nome.toLocaleLowerCase() == request.query.nome.toLocaleLowerCase()
    );

    if (!filtroPrato) {
      return response.status(400).json("Não existe um prato com esse nome!");
    }

    return response.json(filtroPrato);
  }

  return response.json(pratos);
});

//CRIA PRATOS
app.post("/pratos", autenticaUsuario, (request, response) => {
  const body = request.body;

  const existePrato = pratos.find((item) => {
    return item.nome.toLocaleLowerCase() == body.nome.toLocaleLowerCase();
  });

  if (existePrato) {
    return response.status(400).json("Já existe um prato com esse nome!");
  }

  const novoPrato = {
    id: uuidv4(),
    nome: body.nome,
    descricao: body.descricao,
    preco: body.preco,
  };

  pratos.push(novoPrato);

  return response.json(pratos);
});

//ATUALIZA PRATOS
app.put("/pratos/:id", autenticaUsuario, (request, response) => {
  const idURL = request.params.id;
  const body = request.body;

  if (body.nome == undefined)
    return response.status(400).json("nome não informado!");

  if (body.descricao == undefined)
    return response.status(400).json("descricao não informado!");

  if (body.preco == undefined)
    return response.status(400).json("preco não informado!");

  const indicePrato = pratos.findIndex((item) => item.id === idURL);

  if (indicePrato == -1) {
    return response.status(400).json("Prato não encontrado!");
  }

  const pratoDaLista = pratos[indicePrato];

  pratoDaLista.nome = body.nome;
  pratoDaLista.descricao = body.descricao;
  pratoDaLista.preco = body.preco;

  return response.json(pratoDaLista);
});

//DELETA PRATOS
app.delete("/pratos/:id", autenticaUsuario, function (request, response) {
  const idURL = request.params.id;
  const indicePrato = pratos.findIndex((item) => item.id === idURL);

  if (indicePrato == -1) {
    return response.status(400).json("Prato não encontrado!");
  }

  pratos.splice(indicePrato, 1);
  return response.status(201).json({
    success: "Prato apagado com sucesso",
    data: pratos,
  });
});

app.listen(8080, () => console.log("Servidor iniciado"));
