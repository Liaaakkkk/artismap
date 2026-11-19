const API_URL = "http://localhost:3001/api/auth";

/*
|--------------------------------------------------------------------------
| CADASTRO
|--------------------------------------------------------------------------
*/

export async function cadastrarUsuario(
  nome,
  email,
  senha,
  tipo = "usuario"
) {
  const resposta = await fetch(`${API_URL}/cadastro`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      nome,
      email,
      senha,
      tipo,
    }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.mensagem || "Erro ao cadastrar usuário."
    );
  }

  const usuario = dados.usuario;

  localStorage.setItem(
    "usuario",
    JSON.stringify(usuario)
  );

  return usuario;
}

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export async function loginUsuario(
  email,
  senha,
  tipo = "usuario"
) {
  const resposta = await fetch(`${API_URL}/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
      senha,
      tipo,
    }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.mensagem || "E-mail ou senha incorretos."
    );
  }

  const usuario = dados.usuario;

  localStorage.setItem(
    "usuario",
    JSON.stringify(usuario)
  );

  return usuario;
}

/*
|--------------------------------------------------------------------------
| USUÁRIO LOGADO
|--------------------------------------------------------------------------
*/

export function obterUsuario() {
  const usuario = localStorage.getItem("usuario");

  if (!usuario) {
    return null;
  }

  try {
    return JSON.parse(usuario);
  } catch {
    localStorage.removeItem("usuario");
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export function logoutUsuario() {
  localStorage.removeItem("usuario");
}

/*
|--------------------------------------------------------------------------
| VERIFICAÇÃO
|--------------------------------------------------------------------------
*/

export function usuarioEstaLogado() {
  return localStorage.getItem("usuario") !== null;
}

// Atualiza a foto de perfil no MongoDB.
export async function atualizarFotoPerfil(usuarioId, arquivo) {
  if (!arquivo) {
    throw new Error("Selecione uma imagem.");
  }

  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (!tiposPermitidos.includes(arquivo.type)) {
    throw new Error("Escolha uma imagem JPG, PNG ou WEBP.");
  }

  if (arquivo.size > 2 * 1024 * 1024) {
    throw new Error("A imagem deve ter no máximo 2 MB.");
  }

  const fotoPerfil = await new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(
      new Error("Não foi possível ler a imagem.")
    );

    leitor.readAsDataURL(arquivo);
  });

  const resposta = await fetch(`${API_URL}/${usuarioId}/foto`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fotoPerfil }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.mensagem || "Não foi possível atualizar a foto."
    );
  }

  const usuarioAtualizado = dados.usuario;

  localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));

  return usuarioAtualizado;
}
