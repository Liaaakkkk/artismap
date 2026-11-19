import { useState } from "react";
import "../styles/UserProfile.css";

const opcoesGenero = [
  "Mulher",
  "Homem",
  "Pessoa não-binária",
  "Agênero",
  "Outro",
  "Prefiro não informar",
];

const opcoesPronome = [
  "Ela/dela",
  "Ele/dele",
  "Elu/delu",
  "Ela/elu",
  "Ele/elu",
  "Prefiro não informar",
  "Outro",
];

function carregarPerfil(email) {
  try {
    return JSON.parse(
      localStorage.getItem(`artismap-perfil-${email}`) || "{}"
    );
  } catch {
    return {};
  }
}

function UserProfile({ usuario, onPhotoChange, onBack, onLogout }) {
  const salvo = carregarPerfil(usuario?.email || "visitante");
  const [telefone, setTelefone] = useState(salvo.telefone || usuario?.telefone || "");
  const [genero, setGenero] = useState(salvo.genero || usuario?.genero || "");
  const [pronome, setPronome] = useState(salvo.pronome || usuario?.pronome || "");
  const [outroPronome, setOutroPronome] = useState(salvo.outroPronome || "");
  const [eventosParticipados, setEventosParticipados] = useState(
    String(salvo.eventosParticipados ?? usuario?.eventosParticipados ?? 0)
  );
  const [mensagem, setMensagem] = useState("");

  function salvarPerfil(event) {
    event.preventDefault();
    const dados = {
      telefone: telefone.trim(),
      genero,
      pronome,
      outroPronome: pronome === "Outro" ? outroPronome.trim() : "",
      eventosParticipados: Math.max(0, Number(eventosParticipados) || 0),
    };

    localStorage.setItem(
      `artismap-perfil-${usuario?.email || "visitante"}`,
      JSON.stringify(dados)
    );
    setMensagem("Suas informações foram salvas neste dispositivo.");
  }

  async function alterarFoto(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    try {
      await onPhotoChange(arquivo);
      setMensagem("Foto de perfil atualizada com sucesso.");
    } catch (error) {
      setMensagem(error.message || "Não foi possível atualizar a foto.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="app profile-screen">
      <section className="profile-page">
        <button type="button" className="profile-back-button" onClick={onBack}>
          ← Voltar
        </button>

        <header className="user-profile-heading">
          <div className="profile-avatar">
            {usuario?.fotoPerfil ? (
              <img src={usuario.fotoPerfil} alt="Foto de perfil" />
            ) : "👤"}
          </div>
          <label htmlFor="foto-perfil-usuario" className="user-profile-photo-button">
            Alterar foto
          </label>
          <input
            id="foto-perfil-usuario"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={alterarFoto}
            hidden
          />
          <h1>{usuario?.nome || "Meu perfil"}</h1>
          <p>Suas informações no ArtisMap</p>
        </header>

        <form className="user-profile-card" onSubmit={salvarPerfil}>
          <div className="user-profile-card-title">
            <span>MINHA CONTA</span>
            <h2>Informações pessoais</h2>
            <p>Atualize seus dados e conte um pouco sobre você.</p>
          </div>

          <label className="user-profile-field">
            E-mail
            <input type="email" value={usuario?.email || ""} readOnly />
            <small>O e-mail da conta não pode ser alterado aqui.</small>
          </label>

          <label className="user-profile-field">
            Telefone
            <input
              type="tel"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="(85) 99999-9999"
              autoComplete="tel"
            />
          </label>

          <label className="user-profile-field">
            Gênero
            <select value={genero} onChange={(event) => setGenero(event.target.value)}>
              <option value="">Selecione uma opção</option>
              {opcoesGenero.map((opcao) => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </label>

          <label className="user-profile-field">
            Pronomes
            <select value={pronome} onChange={(event) => setPronome(event.target.value)}>
              <option value="">Selecione seus pronomes</option>
              {opcoesPronome.map((opcao) => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </label>

          {pronome === "Outro" && (
            <label className="user-profile-field">
              Quais pronomes você utiliza?
              <input
                type="text"
                value={outroPronome}
                onChange={(event) => setOutroPronome(event.target.value)}
                placeholder="Digite seus pronomes"
              />
            </label>
          )}

          <label className="user-profile-field">
            Quantidade de eventos de que já participou
            <input
              type="number"
              min="0"
              step="1"
              value={eventosParticipados}
              onChange={(event) => setEventosParticipados(event.target.value)}
            />
            <small>Informe quantos eventos culturais você já frequentou.</small>
          </label>

          <button type="submit" className="user-profile-save">
            Salvar informações
          </button>
          {mensagem && <p className="user-profile-message" role="status">{mensagem}</p>}
        </form>

        <button type="button" className="logout-button" onClick={onLogout}>
          Sair da conta
        </button>
      </section>
    </main>
  );
}

export default UserProfile;
