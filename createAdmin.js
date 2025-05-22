import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/Models/useModel.js";

const MONGO_URL = "mongodb://localhost:27017/sistemadop"; // ajuste se necessário

async function createOrUpdateAdmin() {
  await mongoose.connect(MONGO_URL);

  const password = "admin123"; // senha desejada
  const passwordHash = await bcrypt.hash(password, 10);

  const adminData = {
    nickname: "admin",
    password: passwordHash,
    patent: "Administrador",
    classes: ["Instrução Inicial [INS]"],
    teans: ["System"],
    status: "Ativo",
    tag: "Vazio",
    warnings: 0,
    medals: 0,
    userType: "Admin"
  };

  await User.findOneAndUpdate(
    { nickname: "admin" },
    adminData,
    { upsert: true, new: true }
  );

  console.log("Usuário admin criado ou atualizado com sucesso!");
  await mongoose.disconnect();
}

createOrUpdateAdmin().catch(console.error); 