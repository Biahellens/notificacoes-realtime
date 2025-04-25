<script lang="ts">
  import { onMount } from "svelte";
  import { io } from "socket.io-client";

  let token = "";
  // biome-ignore lint/style/useConst: <explanation>
  let userId = "";
  // biome-ignore lint/style/useConst: <explanation>
  let title = "";
  // biome-ignore lint/style/useConst: <explanation>
  let message = "";
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let socket;

  async function login() {
    const res = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    token = data.token;

    socket = io("http://localhost:3001");
    socket.emit("auth", token);
    socket.on("receive-notification", (notif) => {
      alert(`🔔 ${notif.title}: ${notif.message}`);
    });
  }

  async function sendNotification() {
    await fetch("http://localhost:3001/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, message })
    });
  }
</script>

<h1>Notificações em Tempo Real</h1>

<input bind:value={userId} placeholder="Seu ID de usuário" />
<button on:click={login}>Login</button>

<br/><br/>
<input bind:value={title} placeholder="Título" />
<input bind:value={message} placeholder="Mensagem" />
<button on:click={sendNotification}>Enviar notificação</button>
