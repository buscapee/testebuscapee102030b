import { User } from "../Models/useModel.js";
import { InfoSystem } from "../Models/systemModel.js";
import { Utils } from "../utils/UserUtils.js";
import mongoose, { Types }from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const utils = new Utils();

export default class ServiceControllerSystem {

  async createInfo(req, res) {
    try {
      const { name, patents, paidPositions, teams } = req.body;
      const idUser = req.idUser;
      const nickname = await User.findOne({ _id: idUser });

      if (nickname && nickname.userType !== "Admin") {
        return res.status(422).json({ error: 'Ops! Você não é um administrador.' })
      }

      if (!name || !patents || !paidPositions || !teams) {
        return res.status(422).json({ error: 'Preencha todos os campos' })
      }

      const newInfo = {
        name,
        patents,
        paidPositions,
        teams,
      }

      const createInfo = await InfoSystem.create(newInfo)

      if (!createInfo) {
        return res.status(422).json({ error: 'Ops! Parece que houve um erro, tente novamente mais tarde.' })
      }

      res.status(201).json({ msg: 'Equipe criada com sucesso.' })

    } catch (error) {
      console.error('Erro ao registrar', error);
      res.status(500).json({ msg: 'Erro ao cadastrar equipe.' })
    }
  };

  async getInfoSystem(req, res) {
    try {
      const info = await utils.getInfos()
      const systemInfo = await InfoSystem.find();
      return res.json(systemInfo)
    } catch (error) {

      console.error('Informações não encontradas', error);
      res.status(500).json({ msg: 'Informações não encontradas' })
    }
  };

  async getInfoSystemDpanel(req, res) {
    try {
      const info = await utils.getInfos()
      const systemInfo = await InfoSystem.find();
      return res.json({ info, systemInfo })

    } catch (error) {

      console.error('Informações não encontradas', error);
      res.status(500).json({ msg: 'Informações não encontradas' })
    }
  };

  async updateInfos(req, res) {
    try {
      const { destaque1, destaque2, destaque3, destaque4, oficiaisMes, slides } = req.body;
      const userAdmin = await User.findById(req.idUser);
      const system = await InfoSystem.findOne()

      if (!userAdmin) {
        return res.status(404).json({ error: 'Ops! Usuário não encontrado.' });
      }

      if (userAdmin.userType === "Admin" || userAdmin.userType === "Diretor") {
        system.destaques1 = destaque1
        system.destaques2 = destaque2
        system.destaques3 = destaque3
        system.destaques4 = destaque4
        if (oficiaisMes && Array.isArray(oficiaisMes)) {
          system.oficiaisMes = oficiaisMes.slice(0, 20); // Limita a 20 oficiais
        }
        if (slides && Array.isArray(slides)) {
          system.slides = slides.slice(0, 10); // Limita a 10 slides
        }
        await system.save();
        return res.status(200).json({ msg: `Informações atualizadas com sucesso.` });
      }
      return res.status(403).json({ msg: 'Ops! Parece que você não é um administrador.' });
    } catch (error) {
      console.error('Ops! Não foi possível atualizar o documento.', error);
      res.status(500).json({ msg: 'Ops! Não foi possível atualizar o documento.' });
    }
  };

  async exportAllCollections(req, res) {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const databaseBackup = {};

      for (let collection of collections) {
        const collectionName = collection.name;
        const collectionData = await db.collection(collectionName).find().toArray();
        databaseBackup[collectionName] = collectionData;
      }

      // Use o __dirname corretamente aqui
      const backupFilePath = path.join(__dirname, '../backup/databaseBackup.json');

      fs.writeFileSync(backupFilePath, JSON.stringify(databaseBackup, null, 2), 'utf-8');

      res.download(backupFilePath, 'databaseBackup.json', (err) => {
        if (err) {
          console.error('Erro ao enviar arquivo para download:', err);
          return res.status(500).json({ msg: 'Erro ao enviar arquivo para download' });
        }
      });

    } catch (error) {
      console.error('Erro ao exportar banco de dados:', error);
      res.status(500).json({ msg: 'Erro ao exportar banco de dados' });
    }
  }

  async searchUserPatent(req, res) {
    try {
      const { patent, nickname } = req.query; // Extrair patent e nickname de req.query
      const systemDb = await InfoSystem.find();
      const selectInfo = systemDb[0];

      if (selectInfo.patents.includes(patent) || selectInfo.paidPositions.includes(patent)) {
        let users = await User.find({
          patent: patent,
          $or: [
            { status: "Ativo" },
            { status: "Pendente" } // Substitua "OutroStatus" pelo outro status que deseja incluir
          ]
        });

        if (nickname) {
          users = users.filter(user => user.nickname.includes(nickname));
        }

        return res.json(users);
      }

      return res.status(401).json({ error: 'Patente não encontrada' });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  async getHonrarias(req, res) {
    try {
      const system = await InfoSystem.findOne();
      if (!system) return res.status(404).json({ error: 'Sistema não encontrado.' });
      res.json(system.honrarias || []);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar honrarias.' });
    }
  }

  async addHonraria(req, res) {
    try {
      const { nome, imagem } = req.body;
      if (!nome || !imagem) return res.status(400).json({ error: 'Nome e imagem são obrigatórios.' });
      const system = await InfoSystem.findOne();
      if (!system) return res.status(404).json({ error: 'Sistema não encontrado.' });
      system.honrarias.push({ nome, imagem });
      await system.save();
      res.status(201).json({ msg: 'Honraria adicionada com sucesso.', honrarias: system.honrarias });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao adicionar honraria.' });
    }
  }

  async editHonraria(req, res) {
    try {
      const { index, nome, imagem } = req.body;
      const system = await InfoSystem.findOne();
      if (!system) return res.status(404).json({ error: 'Sistema não encontrado.' });
      if (typeof index !== 'number' || !system.honrarias[index]) return res.status(400).json({ error: 'Honraria não encontrada.' });
      if (!nome || !imagem) return res.status(400).json({ error: 'Nome e imagem são obrigatórios.' });
      system.honrarias[index] = { nome, imagem };
      await system.save();
      res.status(200).json({ msg: 'Honraria editada com sucesso.', honrarias: system.honrarias });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao editar honraria.' });
    }
  }

  async deleteHonraria(req, res) {
    try {
      const { index } = req.body;
      const system = await InfoSystem.findOne();
      if (!system) return res.status(404).json({ error: 'Sistema não encontrado.' });
      if (typeof index !== 'number' || !system.honrarias[index]) return res.status(400).json({ error: 'Honraria não encontrada.' });
      system.honrarias.splice(index, 1);
      await system.save();
      res.status(200).json({ msg: 'Honraria removida com sucesso.', honrarias: system.honrarias });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover honraria.' });
    }
  }

  // async importDatabase(req, res) {
  //   try {
  //     // Lê o arquivo de backup
  //     const backupFilePath = path.join(__dirname, '../backup/databaseBackup.json');
  //     const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));
  
  //     // Itera sobre as coleções no backup e cria as coleções no novo banco de dados
  //     for (const collectionName in backupData) {
  //       const collectionData = backupData[collectionName];
  
  //       // Cria uma nova coleção
  //       const newCollection = mongoose.connection.collection(collectionName);
  
  //       // Verifica se há dados para inserir
  //       if (collectionData.length > 0) {
  //         // Formata os dados para garantir que cada _id seja um ObjectId
  //         const formattedData = collectionData.map(doc => ({
  //           ...doc,
  //           _id: doc._id ? new Types.ObjectId(doc._id) : new Types.ObjectId() // Garante que _id seja um ObjectId
  //         }));
  
  //         // Insere os dados da coleção no novo banco de dados
  //         await newCollection.insertMany(formattedData, { ordered: false });
  //         console.log(`Coleção ${collectionName} importada com sucesso!`);
  //       } else {
  //         console.log(`Coleção ${collectionName} está vazia. Nenhum dado a importar.`);
  //       }
  //     }
  
  //     return res.status(200).json({ message: 'Importação do banco de dados concluída!' });
  //   } catch (error) {
  //     console.error('Erro ao importar o banco de dados:', error);
  //     return res.status(500).json({ message: 'Erro ao importar o banco de dados: ' + error.message });
  //   }
  // }
  // // Rota para exportar o banco de dados
  // async exportAllCollections(req, res) {
  //   try {
  //     const db = mongoose.connection.db;
  //     const collections = await db.listCollections().toArray();
  //     const databaseBackup = {};

  //     for (let collection of collections) {
  //       const collectionName = collection.name;
  //       const collectionData = await db.collection(collectionName).find().toArray();
  //       databaseBackup[collectionName] = collectionData;
  //     }

  //     // Use o __dirname corretamente aqui
  //     const backupFilePath = path.join(__dirname, '../backup/databaseBackup.json');

  //     fs.writeFileSync(backupFilePath, JSON.stringify(databaseBackup, null, 2), 'utf-8');

  //     res.download(backupFilePath, 'databaseBackup.json', (err) => {
  //       if (err) {
  //         console.error('Erro ao enviar arquivo para download:', err);
  //         return res.status(500).json({ msg: 'Erro ao enviar arquivo para download' });
  //       }
  //     });

  //   } catch (error) {
  //     console.error('Erro ao exportar banco de dados:', error);
  //     res.status(500).json({ msg: 'Erro ao exportar banco de dados' });
  //   }
  // }

  
}
