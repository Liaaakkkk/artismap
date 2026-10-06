const API_URL = "http://localhost:3001";

// CADASTRAR USUÁRIO
export async function cadastrarUsuario(nome, email, senha) {
  const resposta = await fetch(`${API_URL}/register`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      nome,
      email,
      senha,
    }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || "Erro ao cadastrar usuário.");
  }

  return dados.usuario;
}


// LOGIN
export async function loginUsuario(email, senha) {
  const resposta = await fetch(`${API_URL}/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
      senha,
    }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || "E-mail ou senha incorretos.");
  }

  const usuarioLogado = dados.usuario;

  localStorage.setItem(
    "usuario",
    JSON.stringify(usuarioLogado)
  );

  return usuarioLogado;
}


// OBTER USUÁRIO LOGADO
export function obterUsuario() {
  const usuario = localStorage.getItem("usuario");

  if (!usuario) {
    return null;
  }

  return JSON.parse(usuario);
}


// SAIR DA CONTA
export function logoutUsuario() {
  localStorage.removeItem("usuario");
}


// VERIFICAR SE ESTÁ LOGADO
export function usuarioEstaLogado() {
  return localStorage.getItem("usuario") !== null;
}