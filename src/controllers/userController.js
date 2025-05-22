import { User } from "../Models/useModel.js";
import { Requirements } from "../Models/RequirementsModel.js";
import { InfoSystem } from "../Models/systemModel.js";
import { Utils } from "../utils/UserUtils.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


const utils = new Utils();

const GenerateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    }
  );
};
export default class ServiceControllerUser {
  async login(req, res) {
    try {
      const { nick, password } = req.body;
      const origin = req.headers
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      console.log(origin)
      const checkUser = await User.findOne({ nickname: nick });

      if (!checkUser) {
        return res.status(400).json({ error: 'Usuário não encontrado.' });
      }

      if (checkUser.status === "CFO") {
        return res.status(400).json({ error: 'Sua conta está suspensa até que termine seu CFO.' });
      }

      if (checkUser.status === "Pendente") {
        return res.status(400).json({ error: 'Por favor ative sua conta no sistema.' });
      }

      if (checkUser.status === "Desativado") {
        return res.status(400).json({ error: 'Sua conta está desativada.' });
      }

      if (checkUser.status === "Exonerado") {
        return res.status(400).json({ error: 'Sua conta está exonerada.' });
      }

      const isMatch = await bcrypt.compare(password, checkUser.password);
      if (!isMatch || checkUser.nickname !== nick) {
        return res.status(400).json({ error: 'Nickname ou senha incorretos.' });
      }

      await utils.createLogger("Efetuou o login no sistema.", checkUser.nickname, " ", ipAddress);
      const tokenActive = GenerateToken(checkUser._id);
      await utils.tokenActiveDb(checkUser.nickname, tokenActive);

      return res.status(201).json({
        _id: checkUser._id,
        nickname: checkUser.nickname,
        patent: checkUser.patent,
        classes: checkUser.classes,
        teans: checkUser.teans,
        status: checkUser.status,
        userType: checkUser.userType,
        token: tokenActive,
        ip: ipAddress
      });

    } catch (error) {
      console.error("Erro ao efetuar o login:", error);
      res.status(500).json({ msg: "Erro ao efetuar o login." });
    }
  };

  async updateUser(req, res) {
    try {
      const { securityCode, formdata } = req.body;
      const { newUserDopSystem, newPasswordDopSystem, newPasswordDopSystemConf } = formdata;
      const nickname = await User.findOne({ nickname: newUserDopSystem });

      if (!nickname || nickname.nickname === "DMESystem") {
        res.status(404).json({ msg: 'Ops! Usuário não encontrado.' });
      } else {

        const motto = await utils.connectHabbo(nickname.nickname);

        if (newPasswordDopSystemConf !== newPasswordDopSystem) {
          return res.status(404).json({ msg: "Senha incorreta tente novamente." });
        };

        if (motto.motto.trim() !== securityCode) {
          return res.status(404).json({ msg: "Ops! Seu código de acesso está errado, por favor verifique sua missão." });
        };

        if (nickname.status === 'Pendente' || nickname.status === 'Ativo') {

          const saltHash = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(newPasswordDopSystem, saltHash);

          nickname.nickname = nickname.nickname;
          nickname.patent = nickname.patent;
          nickname.classes = nickname.classes;
          nickname.teans = nickname.teans;
          nickname.status = 'Ativo';
          nickname.tag = nickname.tag;
          nickname.warnings = nickname.warnings;
          nickname.medals = nickname.medals;
          nickname.password = passwordHash;
          nickname.userType = nickname.userType;
          await nickname.save();
          // LOG
          const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          await utils.createLogger('Ativou o usuário', nickname.nickname, nickname.nickname, ipAddress);
          return res.status(200).json({ msg: 'Usuário ativado com sucesso' });

        };

        return res.status(404).json({ msg: "Ops! Este usuário já se encontra ativo" });
      };

    } catch (error) {
      console.error('Não foi possível atualizar o usuário.', error);
      res.status(500).json({ msg: 'Não foi possível atualizar o usuário.' })
    }

  };
  //Para deletar é necessário passar um parametro que é o ID do usuário que será deletado e o nick do usuário que irá deletar.
  // O código irá verificar se quem está deletando é admin e se quem será deletado existe no banco de dados.
  async updateUserAdmin(req, res) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const idUser = req.idUser;
      const { idEdit, nickname, patent, status, tag, warnings, medals, userType, honrarias } = req.body;
      const admin = await User.findOne({ _id: idUser });
      const cont = await User.findOne({ _id: idEdit });
      if (cont._id === process.env.CONT_MASTER_ID) {
        return res.status(404).json({ error: 'Ops! Você não pode atualizar a conta master.' });
      }

      if (!admin || !cont) {
        await utils.createLogger(
          "Tentativa de alteração de usuário sem admin válido",
          admin ? admin.nickname : "Desconhecido",
          cont ? cont.nickname : "Desconhecido",
          ipAddress
        );
        return res.status(404).json({ error: 'Dados não encontrados.' });
      } else {

        if (admin.userType === "Admin") {

          const oldMedals = cont.medals;
          cont.nickname = nickname ? nickname : cont.nickname;
          cont.classes = cont.classes;
          cont.teans = cont.teans;
          cont.patent = patent ? patent : cont.patent;
          cont.status = status ? status : cont.status;
          cont.tokenActive = status !== cont.status ? " " : cont.tokenActive
          cont.tag = tag ? tag : cont.tag;
          cont.warnings = warnings ? warnings : cont.warnings;
          cont.medals = typeof medals !== 'undefined' ? Number(medals) : cont.medals;
          cont.password = cont.password;
          cont.userType = userType ? userType : cont.userType;
          if (Array.isArray(honrarias)) {
            cont.honrarias = honrarias;
          }
          // Registrar histórico de moedas se houve alteração
          if (typeof medals !== 'undefined' && medals !== oldMedals) {
            cont.coinsHistory = cont.coinsHistory || [];
            cont.coinsHistory.push({
              value: medals - oldMedals,
              date: new Date(),
              operator: admin.nickname
            });
          }
          await cont.save();
          await utils.createLogger(`Alterou o perfil do usuário`, admin.nickname, cont.nickname, ipAddress);
          return res.status(200).json({ msg: 'Usuário atualizado com sucesso.' });
        }

        return res.status(403).json({ error: 'Você nao tem permissão para atualizar esse usuário.' });

      };

    } catch (error) {
      console.error('Não foi possível atualizar o usuário.', error);
      res.status(500).json({ msg: 'Não foi possível atualizar o usuário.' })
    }

  };

  async createTag(req, res) {
    try {
      const { tag } = req.body;
      const idUser = req.idUser;
      const cont = await User.findOne({ _id: idUser });

      if (!cont) {
        return res.status(404).json({ error: 'Dados não encontrados.' });
      }

      // Transforma o nickname em minúsculas para tornar a comparação insensível a maiúsculas/minúsculas
      const nicknameLower = cont.nickname.toLowerCase();

      // Verifica se todas as letras da tag estão presentes no nickname
      const tagOk = [...tag.toLowerCase()].every(letra => nicknameLower.includes(letra));

      if (tagOk) {
        cont.tag = tag ? tag : cont.tag;
        await cont.save();
        return res.status(200).json({ msg: 'Tag cadastrada com sucesso' });
      } else {
        return res.status(400).json({ error: 'Os caracteres não estão presentes no seu nickname.' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Ocorreu um erro ao processar a requisição.' });
    }

  };

  async deleteUsers(req, res) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userId = req.params.userId;

      const admin = await User.findById(req.idUser);
      const deleteUser = await User.findById(userId);
      if (deleteUser.nickname === process.env.CONT_MASTER_ID) {
        return res.status(404).json({ error: 'Ops! Você não pode excluir a conta master.' });
      }

      if (!deleteUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      if (admin && admin.userType !== "Admin") {
        return res.status(404).json({ error: 'Ops! Parece que você não é uma administrador.' });
      }

      if (admin && admin.userType === "Admin" && deleteUser) {
        await User.findByIdAndDelete(userId);
        await Requirements.deleteMany({ promoted: deleteUser.nickname });
        await utils.createLogger(`Deletou o usuário ${deleteUser.nickname}`, admin.nickname, deleteUser.nickname, ipAddress);
        return res.status(200).json({ msg: 'Usuário deletedo com sucesso' });
      }

    } catch (error) {
      console.error('Não foi possível deletar o usuário', error);
      res.status(500).json({ msg: 'Não foi possível deletar o usuário' })
    }
  };

  async getcurrentUser(req, res) {
    try {
      const userID = req.idUser;
      const user = req.user;
      res.status(200).json(user);

    } catch (error) {
      console.log('Perfil não encontrado')
    }

  };

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const nickname = req.query.nickname; // Captura o nickname da query string

      let query;
      if (nickname) {
        query = User.find({ nickname: nickname }).select("-password -tokenActive -tokenIsNotValide");
      } else {
        query = User.find().select("-password -tokenActive -tokenIsNotValide");
      }

      const users = await query
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      // Inclui o campo currentLocation explicitamente na resposta
      const usersWithLocation = users.map(user => ({
        ...user.toObject(),
        currentLocation: user.currentLocation || "/"
      }));

      res.json(usersWithLocation);
    } catch (error) {
      console.error('Erro ao recuperar usuários:', error); 
      res.status(500).json({ error: 'Erro ao recuperar usuários' });
    }
  };

  async getAllNicks(req, res) {
    try {
      const users = await User.find();
      // Mapeia a lista de usuários para extrair apenas os apelidos
      const nicknames = users.map(user => user.nickname);

      return res.json(nicknames);

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ msg: 'Erro ao buscar usuários' });
    }
  }

  async searchUser(req, res) {
    try {
      const nickname = req.query.nickname;
      const typeRequeriment = req.query.typeRequeriment;
      // Busca parcial e case-insensitive direto no banco
      const query = nickname
        ? { nickname: { $regex: nickname, $options: 'i' } }
        : {};
      const users = await User.find(query).sort({ nickname: 1 }).select("-password -tokenActive -tokenIsNotValide");
      console.log("Busca por nickname:", nickname, "Resultado:", users.map(u => u.nickname));
      const info = await InfoSystem.findOne();
      if (!info || !info.patents || !info.paidPositions) {
        return res.status(500).json({ msg: 'Informações do sistema não encontradas.' });
      }
      const newPatents = users.map(user => {
        const patentRelegationIndex = info.patents.includes(user.patent)
          ? info.patents.indexOf(user.patent)
          : info.paidPositions.indexOf(user.patent);
        if (typeRequeriment === "Promoção") {
          const indexRealOperator = patentRelegationIndex + 1;
          return info.patents[indexRealOperator];
        }
        if (typeRequeriment === "Rebaixamento") {
          const indexRealOperator = patentRelegationIndex - 1;
          return info.patents[indexRealOperator];
        }
      });
      return res.json({ users, newPatents });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  async permissions(req, res) {
    try {
      const userTypes = ['Admin', 'Diretor', 'Recursos Humanos'];
      const users = await User.find({ userType: { $in: userTypes } }).select("nickname patent userType");;
      return res.json(users);

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  async logoutPass(req, res) {
    try {
      res.status(200).json({ message: 'Logout realizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      res.status(500).json({ error: 'Erro ao fazer logout.' });
    }
  };

  async updateLocation(req, res) {
    try {
      const userId = req.idUser;
      const { location } = req.body;
      const io = req.app.get('io');
      console.log('[DEBUG] Requisição recebida para atualizar localização:', { userId, location });
      if (!location) {
        console.log('[DEBUG] Localização não fornecida.');
        return res.status(400).json({ error: 'Localização não fornecida.' });
      }
      const user = await User.findById(userId);
      if (!user) {
        console.log('[DEBUG] Usuário não encontrado:', userId);
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      user.currentLocation = location;
      await user.save();
      console.log('[DEBUG] Localização salva com sucesso para o usuário:', user.nickname, location);
      // Emitir evento para todos os clientes conectados
      if (io) {
        io.emit('userLocationUpdate', {
          nickname: user.nickname,
          currentLocation: user.currentLocation
        });
      }
      return res.status(200).json({ msg: 'Localização atualizada com sucesso.' });
    } catch (error) {
      console.error('[DEBUG] Erro ao atualizar localização:', error);
      res.status(500).json({ error: 'Erro ao atualizar localização.' });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, newPasswordConf } = req.body;
      const user = await User.findById(req.idUser);

      if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado.' });
      }

      // Verifica se a nova senha e a confirmação coincidem
      if (newPassword !== newPasswordConf) {
        return res.status(400).json({ msg: 'As novas senhas não coincidem.' });
      }

      // Verifica se a senha atual está correta
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Senha atual incorreta.' });
      }

      // Atualiza a senha
      const saltHash = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, saltHash);
      await user.save();

      return res.status(200).json({ msg: 'Senha alterada com sucesso.' });
    } catch (error) {
      return res.status(500).json({ msg: 'Erro ao alterar a senha.' });
    }
  }

  async getCoinsHistory(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
      res.json(user.coinsHistory || []);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar histórico de moedas.' });
    }
  }
};
