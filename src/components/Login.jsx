import { useState } from "react";

import { loginUsuario } from "../utils/auth";

function Login({ onLogin, onCriarConta }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    // Verifica se os campos foram preenchidos
    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    // Verifica se o e-mail possui @
    if (!email.includes("@")) {
      setErro("Digite um e-mail válido.");
      return;
    }

    // Verifica o tamanho da senha
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Tenta fazer o login
    const usuario = loginUsuario(email, senha);

    // Se não encontrou a conta ou a senha está errada
    if (!usuario) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    // Login deu certo
    onLogin(usuario);
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Cabeçalho */}
        <div className="login-header">
          <h1>ArtisMap</h1>

          <p>
            Onde a rota é o caminho para arte.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>

          {/* E-mail */}
          <div className="login-field">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="seuemail@email.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </div>

          {/* Senha */}
          <div className="login-field">
            <label htmlFor="senha">
              Senha
            </label>

            <div className="password-container">
              <input
                id="senha"
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) => {
                  setSenha(event.target.value);
                }}
              />

              <button
                type="button"
                className="show-password"
                onClick={() => {
                  setMostrarSenha(!mostrarSenha);
                }}
              >
                {mostrarSenha
                  ? "Ocultar"
                  : "Mostrar"}
              </button>
            </div>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <p className="login-error">
              {erro}
            </p>
          )}

          {/* Botão de entrar */}
          <button
            type="submit"
            className="login-button"
          >
            Entrar
          </button>
        </form>

        {/* Cadastro */}
        <p className="login-register">
          Ainda não possui uma conta?

          <button
            type="button"
            onClick={onCriarConta}
          >
            Criar conta
          </button>
        </p>

      </div>
    </div>
  );
}

export default Login;