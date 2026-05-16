const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const Document = require("./models/Document");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB error:", error));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);

  if (document) return document;

  return await Document.create({
    _id: id,
    data: "",
  });
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);

    socket.join(documentId);

    socket.emit("load-document", document.data);

    // Multi-user editing
    socket.on("send-changes", (data) => {
      socket.broadcast.to(documentId).emit("receive-changes", data);
    });

    // Autosave document
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });

    // Live cursor tracking
    socket.on("send-cursor", (cursorData) => {
      socket.broadcast.to(documentId).emit("receive-cursor", {
        userId: socket.id,
        range: cursorData.range,
        name: cursorData.name,
        color: cursorData.color,
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
