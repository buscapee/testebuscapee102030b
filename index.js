import express from "express"
import cors from "cors"
import bodyParser from "body-parser" 
import AppRoutes from "./src/routes/router.js";
import { connectdb } from "./src/DB/connect.js"
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT_APP || 3000;

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'https://buscape1030frontend.vercel.app',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
  }
});
app.set('io', io);

// Configuração do CORS
app.use(cors({
  origin: 'https://buscape1030frontend.vercel.app',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());

connectdb();

app.use('/api', AppRoutes);

server.listen(port, () => {
  console.log(`Servidor HTTP/WebSocket online na porta ${port}, acesse: https://testebuscapee102030b.onrender.com`);
});
//aa