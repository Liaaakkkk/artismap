import { useState } from "react";

import { cadastrarUsuario } from "../utils/auth";

function Cadastro({ onCadastro, onVoltar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

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
      setErro("A senha deve ter pelo menos 6 caracteres.");
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
        senha
      );

      onCadastro(usuario);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card cadastro-card">

        <button
          type="button"
          className="login-back-button"
          onClick={onVoltar}
        >
          ← Voltar
        </button>

        <div className="login-header">
          <h1>ArtisMap</h1>

          <p>
            Crie sua conta para explorar
            a cultura de Fortaleza.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* NOME */}
          <div className="login-field">
            <label htmlFor="nome">
              Nome
            </label>

            <input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(event) =>
                setNome(event.target.value)
              }
            />
          </div>

          {/* EMAIL */}
          <div className="login-field">
            <label htmlFor="cadastro-email">
              E-mail
            </label>

            <input
              id="cadastro-email"
              type="email"
              placeholder="seuemail@email.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          {/* SENHA */}
          <div className="login-field">
            <label htmlFor="cadastro-senha">
              Senha
            </label>

            <div className="password-container">
              <input
                id="cadastro-senha"
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

          {/* CONFIRMAR SENHA */}
          <div className="login-field">
            <label htmlFor="confirmar-senha">
              Confirmar senha
            </label>

            <div className="password-container">
              <input
                id="confirmar-senha"
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

          {/* ERRO */}
          {erro && (
            <p className="login-error">
              {erro}
            </p>
          )}

          {/* BOTÃO */}
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
            Entrar
          </button>
        </p>

      </div>
    </div>
  );
}

export default Cadastro;