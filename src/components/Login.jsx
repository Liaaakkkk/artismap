import { useState } from "react";
import { loginUsuario } from "../utils/auth";

function Login({ onLogin, onCriarConta }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [tipoLogin, setTipoLogin] = useState("usuario");

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [erro, setErro] = useState("");

  const [carregando, setCarregando] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (!email.includes("@")) {
      setErro("Digite um e-mail válido.");
      return;
    }

    if (senha.length < 6) {
      setErro(
        "A senha deve ter pelo menos 6 caracteres."
      );
      return;
    }

    try {
      setCarregando(true);

      const usuario = await loginUsuario(
        email,
        senha,
        tipoLogin
      );

      onLogin(usuario);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível realizar o login."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>ArtisMap</h1>

          <p>
            Onde a rota é o caminho para arte.
          </p>
        </div>

        <div className="login-type-selector">
          <button
            type="button"
            className={
              tipoLogin === "usuario"
                ? "login-type-button active"
                : "login-type-button"
            }
            onClick={() => {
              setTipoLogin("usuario");
              setErro("");
            }}
          >
            👤 Usuário
          </button>

          <button
            type="button"
            className={
              tipoLogin === "produtor"
                ? "login-type-button active"
                : "login-type-button"
            }
            onClick={() => {
              setTipoLogin("produtor");
              setErro("");
            }}
          >
            🎭 Produtor
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="seuemail@email.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

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
                onChange={(event) =>
                  setSenha(event.target.value)
                }
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setMostrarSenha(!mostrarSenha)
                }
              >
                {mostrarSenha
                  ? "Ocultar"
                  : "Mostrar"}
              </button>
            </div>
          </div>

          {erro && (
            <p className="login-error">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={carregando}
          >
            {carregando
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>

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