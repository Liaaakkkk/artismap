import { useState } from "react";
import { cadastrarUsuario } from "../utils/auth";

function Cadastro({ onCadastro, onVoltar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [tipoConta, setTipoConta] =
    useState("usuario");

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [
    mostrarConfirmarSenha,
    setMostrarConfirmarSenha,
  ] = useState(false);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    if (!nome || !email || !senha || !confirmarSenha) {
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

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);

      const usuario = await cadastrarUsuario(
        nome,
        email,
        senha,
        tipoConta
      );

      onCadastro(usuario);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível criar a conta."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Criar conta</h1>

          <p>
            Faça parte do ArtisMap.
          </p>
        </div>

        <div className="login-type-selector">
          <button
            type="button"
            className={
              tipoConta === "usuario"
                ? "login-type-button active"
                : "login-type-button"
            }
            onClick={() => {
              setTipoConta("usuario");
              setErro("");
            }}
          >
            👤 Usuário
          </button>

          <button
            type="button"
            className={
              tipoConta === "produtor"
                ? "login-type-button active"
                : "login-type-button"
            }
            onClick={() => {
              setTipoConta("produtor");
              setErro("");
            }}
          >
            🎭 Produtor
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="nome">
              Nome
            </label>

            <input
              id="nome"
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(event) =>
                setNome(event.target.value)
              }
            />
          </div>

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

          <div className="login-field">
            <label htmlFor="confirmarSenha">
              Confirmar senha
            </label>

            <div className="password-container">
              <input
                id="confirmarSenha"
                type={
                  mostrarConfirmarSenha
                    ? "text"
                    : "password"
                }
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(event) =>
                  setConfirmarSenha(
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setMostrarConfirmarSenha(
                    !mostrarConfirmarSenha
                  )
                }
              >
                {mostrarConfirmarSenha
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
              ? "Criando conta..."
              : "Criar conta"}
          </button>
        </form>

        <p className="login-register">
          Já possui uma conta?

          <button
            type="button"
            onClick={onVoltar}
          >
            Voltar para o login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;