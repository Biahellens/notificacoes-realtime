import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const users = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("Socket conectado:", socket.id);

  socket.on("auth", (token: string) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
      users.set(payload.userId, socket.id);
      console.log(`Usuário ${payload.userId} registrado`);
    } catch (e) {
      console.log("Token inválido");
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }
  });
});

app.post("/login", (req, res) => {
  const { userId } = req.body;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
  res.json({ token });
});

app.post("/send-notification", (req, res) => {
  const { userId, title, message } = req.body;
  const socketId = users.get(userId);
  if (socketId) {
    io.to(socketId).emit("receive-notification", { title, message });
    return res.sendStatus(200);
  }
  res.status(404).json({ error: "Usuário não conectado" });
});

server.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
