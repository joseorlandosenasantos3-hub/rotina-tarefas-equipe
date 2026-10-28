// Recupera as tarefas salvas no navegador. Se ainda não houver tarefas, começa com uma lista vazia.
let tarefas = JSON.parse(localStorage.getItem("tarefas-equipe")) || [];

const formulario = document.querySelector("#task-form");
const campoTitulo = document.querySelector("#task-title");
const campoResponsavel = document.querySelector("#task-owner");
const campoPrazo = document.querySelector("#task-date");
const campoPrioridade = document.querySelector("#task-priority");
const filtro = document.querySelector("#task-filter");
const campoBusca = document.querySelector("#task-search"); 
const lista = document.querySelector("#task-list");
const mensagem = document.querySelector("#form-message");
const botaoLimpar = document.querySelector("#clear-completed");

const nomesPrioridade = { high: "Alta", normal: "Normal", low: "Baixa" };

function salvarTarefas() {
  localStorage.setItem("tarefas-equipe", JSON.stringify(tarefas));
}

function atualizarResumo() {
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
  document.querySelector("#pending-count").textContent = tarefas.length - concluidas;
  document.querySelector("#done-count").textContent = concluidas;
  document.querySelector("#total-count").textContent = tarefas.length;
}

function formatarPrazo(data) {
  if (!data) return "Sem prazo";
  const [ano, mes, dia] = data.split("-");
  return `Prazo: ${dia}/${mes}/${ano}`;
}

function mostrarTarefas() {
  lista.replaceChildren();

const textoBusca = campoBusca.value.toLowerCase().trim();

const tarefasVisiveis = tarefas.filter((tarefa) => {
  let correspondeAoStatus = true;

  if (filtro.value === "pending") {
    correspondeAoStatus = !tarefa.concluida;
  } else if (filtro.value === "done") {
    correspondeAoStatus = tarefa.concluida;
  }

  const correspondeAoTexto =
    tarefa.titulo.toLowerCase().includes(textoBusca);

  return correspondeAoStatus && correspondeAoTexto;
});
 const estadoVazio = document.querySelector("#empty-state");
estadoVazio.hidden = tarefasVisiveis.length > 0;

if (tarefasVisiveis.length === 0 && textoBusca !== "") {
  estadoVazio.textContent =
    `Nenhuma tarefa encontrada para "${campoBusca.value}".`;
}

  tarefasVisiveis.forEach((tarefa) => {
    const item = document.createElement("article");
    item.className = `task-item${tarefa.concluida ? " is-done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = tarefa.concluida;
    checkbox.setAttribute("aria-label", `Marcar ${tarefa.titulo} como concluída`);
    checkbox.addEventListener("change", () => {
      tarefa.concluida = checkbox.checked;
      salvarTarefas();
      mostrarTarefas();
    });

    const detalhes = document.createElement("div");
    const titulo = document.createElement("p");
    titulo.className = "task-title";
    titulo.textContent = tarefa.titulo;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = [tarefa.responsavel || "Sem responsável", formatarPrazo(tarefa.prazo)].join(" · ");
    detalhes.append(titulo, meta);

    const acoes = document.createElement("div");
    const prioridade = document.createElement("span");
    prioridade.className = `badge ${tarefa.prioridade}`;
    prioridade.textContent = nomesPrioridade[tarefa.prioridade];
    const excluir = document.createElement("button");
    excluir.className = "delete-button";
    excluir.type = "button";
    excluir.textContent = "Excluir";
    excluir.setAttribute("aria-label", `Excluir tarefa ${tarefa.titulo}`);
    excluir.addEventListener("click", () => {
      tarefas = tarefas.filter((itemAtual) => itemAtual.id !== tarefa.id);
      salvarTarefas();
      mostrarTarefas();
    });
    acoes.append(prioridade, excluir);
    item.append(checkbox, detalhes, acoes);
    lista.append(item);
  });

  atualizarResumo();
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const titulo = campoTitulo.value.trim();

  if (!titulo) {
    mensagem.textContent = "Digite uma descrição para a tarefa.";
    campoTitulo.focus();
    return;
  }

  tarefas.unshift({
    id: Date.now(),
    titulo,
    responsavel: campoResponsavel.value.trim(),
    prazo: campoPrazo.value,
    prioridade: campoPrioridade.value,
    concluida: false
  });

  salvarTarefas();
  formulario.reset();
  mensagem.textContent = "";
  filtro.value = "all";
  mostrarTarefas();
  campoTitulo.focus();
});

filtro.addEventListener("change", mostrarTarefas);
campoBusca.addEventListener("input", mostrarTarefas);

botaoLimpar.addEventListener("click", () => {
  if (confirm("Apagar todas as tarefas concluídas?")) {
    tarefas = tarefas.filter((tarefa) => !tarefa.concluida);
    salvarTarefas();
    mostrarTarefas();
  }
});

mostrarTarefas();
