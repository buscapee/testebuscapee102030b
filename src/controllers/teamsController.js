import { Teams } from "../Models/teamsModel.js";
import { User } from "../Models/useModel.js";
import { Requirements } from "../Models/RequirementsModel.js";
import { Utils } from "../utils/UserUtils.js";
import mongoose from "mongoose";

const utils = new Utils();

export default class ServiceControllerTeams {
  async returnInfoTeams(req, res) {
    try {
      const typeRequirement = req.query.typeRequirement;
      const nameTeams = req.query.teams;
      const hoje = new Date();
      const seisDiasAtras = new Date(utils.dataSeisDiasAtras());

      const requeriments = await Requirements.find({
        createdAt: {
          $gte: seisDiasAtras,
          $lte: hoje,
        },
      });

      let newArrayRequirements;
      if (typeRequirement) {
        newArrayRequirements = requeriments.filter(
          (objeto) => objeto.team === typeRequirement
        );
        const teams = await Teams.find({ nameTeams: nameTeams });
        const newResponse = teams[0].members.map((user) => {
          const filteredRequirements = newArrayRequirements.filter(
            (requirement) => requirement.operator === user.nickname
          );

          return {
            user: user,
            requirements: filteredRequirements,
          };
        });

        return res.json(newResponse);
      }

      return res.json(requeriments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  //commit
  async RemoveUserTeams(req, res) {
    try {
      const { idUser, nickMember, idTeams } = req.body;
      const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      // Validação do ID do documento
      if (!mongoose.Types.ObjectId.isValid(idTeams)) {
        return res.status(400).json({ msg: "ID do usuário inválido." });
      }
      const userAdmin = await User.findById(idUser);
      const userMember = await User.findOne({ nickname: nickMember });

      if (!userMember) {
        return res.status(404).json({ msg: "Ops! Usuário não encontrado." });
      }

      if (!userAdmin) {
        return res.status(404).json({ msg: "Ops! Usuário não encontrado." });
      }

      const teamUpdate = await Teams.findById(idTeams);

      if (
        (userAdmin && userAdmin.userType === "Admin") ||
        userAdmin.userType === "Diretor" ||
        teamUpdate.leader === userAdmin.nickname ||
        teamUpdate.viceLeader === userAdmin.nickname
      ) {
        const newArray = teamUpdate.members.filter(
          (user) => user.nickname !== userMember.nickname
        );

        teamUpdate.nameTeams = teamUpdate.nameTeams;
        teamUpdate.teamsType = teamUpdate.teamsType;
        teamUpdate.leader = teamUpdate.leader;
        teamUpdate.viceLeader = teamUpdate.viceLeader;
        teamUpdate.members = newArray;
        teamUpdate.classes = teamUpdate.classes;

        const newArrayMember = userMember.teans.filter(
          (team) => team !== teamUpdate.nameTeams
        );

        userMember.nickname = userMember.nickname;
        userMember.patent = userMember.patent;
        userMember.classes = userMember.classes;
        userMember.teans = newArrayMember;
        userMember.status = userMember.status;
        userMember.tag = userMember.tag ? userMember.tag : "vázio";
        userMember.warnings = userMember.warnings ? userMember.warnings : "0";
        userMember.medals = userMember.medals ? userMember.medals : "0";
        userMember.password = userMember.password;
        userMember.userType = userMember.userType;

        await userMember.save();
        await teamUpdate.save();
        await utils.createLogger(
          "Removeu usuário da equipe",
          userAdmin.nickname,
          `${userMember.nickname} da equipe ${teamUpdate.nameTeams}`,
          ipAddress
        );
        return res.status(200).json({ msg: "Usuário removido com sucesso." });
      }

      return res
        .status(403)
        .json({ msg: "Ops! Parece que você não é um administrador." });
    } catch (error) {
      console.error("Ops! Não foi possível atualizar o documento.", error);
      res
        .status(500)
        .json({ msg: "Ops! Não foi possível atualizar o documento." });
    }
  }

  async addUserTeams(req, res) {
    try {
      const { idUser, nickMember, office, idTeams } = req.body;

      // Validação do ID do documento
      if (!mongoose.Types.ObjectId.isValid(idTeams)) {
        return res.status(400).json({ error: "ID do usuário inválido." });
      }
      const userAdmin = await User.findById(idUser);
      const userMember = await User.findOne({ nickname: nickMember });

      if (!userMember) {
        return res.status(404).json({ error: "Ops! Usuário não encontrado." });
      }

      if (!userAdmin) {
        return res.status(404).json({ error: "Ops! Usuário não encontrado." });
      }

      const teamUpdate = await Teams.findById(idTeams);

      if (
        (userAdmin && userAdmin.userType === "Admin") ||
        userAdmin.userType === "Diretor" ||
        teamUpdate.leader === userAdmin.nickname ||
        teamUpdate.viceLeader === userAdmin.nickname
      ) {
        const newMember = {
          nickname: userMember.nickname,
          office,
        };

        let newMemberArray = teamUpdate.members;
        newMemberArray.push(newMember);

        teamUpdate.nameTeams = teamUpdate.nameTeams;
        teamUpdate.teamsType = teamUpdate.teamsType;
        teamUpdate.leader = teamUpdate.leader;
        teamUpdate.viceLeader = teamUpdate.viceLeader;
        teamUpdate.members = newMemberArray;
        teamUpdate.classes = teamUpdate.classes;

        const newAtt = teamUpdate.nameTeams;
        let newArrayAtt = userMember.teans;
        newArrayAtt.push(newAtt);

        userMember.nickname = userMember.nickname;
        userMember.patent = userMember.patent;
        userMember.classes = userMember.classes;
        userMember.teans = newArrayAtt;
        userMember.status = userMember.status;
        userMember.tag = userMember.tag;
        userMember.warnings = userMember.warnings;
        userMember.medals = userMember.medals;
        userMember.password = userMember.password;
        userMember.userType =
          teamUpdate.nameTeams === "Recursos Humanos"
            ? "Recursos Humanos"
            : userMember.userType;

        await userMember.save();
        await teamUpdate.save();

        return res.status(200).json({ msg: "Usuário adicionado com sucesso." });
      }

      return res
        .status(403)
        .json({ msg: "Ops! Parece que você não é um administrador." });
    } catch (error) {
      console.error("Ops! Não foi possível atualizar o documento.", error);
      res
        .status(500)
        .json({ msg: "Ops! Não foi possível atualizar o documento." });
    }
  }

  async createTeams(req, res) {
    try {
      const ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      console.log(req.body);
      // Aceitar criação sem líder e vice-líder
      const { nameTeams, sigla, emblema, status } = req.body;

      if (!nameTeams || !emblema || !status) {
        return res.status(422).json({ error: "Preencha todos os campos" });
      }

      // Verifica se já existe equipe com esse nome
      const nameTeam = await Teams.findOne({ nameTeams: nameTeams });
      if (nameTeam) {
        return res.status(422).json({ error: "Ops! Essa equipe já existe." });
      }

      const newTeams = {
        nameTeams: nameTeams,
        sigla: sigla || '',
        emblema: emblema,
        status: status,
        url: utils.createURL(nameTeams),
        leader: '',
        viceLeader: '',
        members: [],
        hierarquia: []
      };

      await utils.createLogger(
        `Uma nova equipe foi criada com o nome: ${nameTeams}`,
        'Sistema',
        " ",
        ipAddress
      );

      const createTeams = await Teams.create(newTeams);

      if (!createTeams) {
        return res.status(422).json({
          error: "Ops! Parece que houve um erro, tente novamente mais tarde.",
        });
      }

      return res.status(201).json({ msg: "Equipe criada com sucesso." });
    } catch (error) {
      console.error("Erro ao registrar", error);
      res.status(500).json({ msg: "Erro ao cadastrar equipe." });
    }
  }

  async getAllTeams(req, res) {
    try {
      const teams = await Teams.find();
      res.json(teams);
    } catch (error) {
      console.error("Usuário não encontrado", error);
      res.status(500).json({ msg: "Usuário não encontrado" });
    }
  }

  async updateTeams(req, res) {
    try {
      const idUser = req.idUser;
      const { teamsId, nameTeams, leader, viceLeader, members, emblema } = req.body;

      if (!teamsId || !nameTeams) {
        return res
          .status(422)
          .json({ error: "Preencha todos os campos obrigatórios." });
      }

      const userAdmin = await User.findById(idUser);
      if (!userAdmin) {
        return res.status(422).json({ error: "Usuário não encontrado." });
      }
      if (userAdmin.userType === "Admin" || userAdmin.userType === "Diretor") {
        const teamsUpdate = await Teams.findById(teamsId);

        if (!teamsUpdate) {
          return res.status(404).json({ error: "Ops! Equipe não encontrada." });
        }

        const newURL = teamsUpdate.nameTeams !== nameTeams ? utils.createURL(nameTeams) : teamsUpdate.url;

        // Atualizando líder
        let nicknameLeader = null;
        if (leader && leader.trim() !== "") {
          nicknameLeader = await User.findOne({ nickname: leader });
          if (!nicknameLeader) {
            return res
              .status(422)
              .json({ error: "Ops! Esse líder não existe em nossos sistemas." });
          }
        }

        // Atualizando vice-líder
        let nicknameViceLeader = null;
        if (viceLeader && viceLeader.trim() !== "") {
          nicknameViceLeader = await User.findOne({ nickname: viceLeader });
          if (!nicknameViceLeader) {
            return res.status(422).json({
              error: "Ops! Esse vice-líder não existe em nossos sistemas.",
            });
          }
        }

        // Atualizar membros com o array recebido do frontend, removendo líder/vice-líder se nickname vazio
        let newMembers = Array.isArray(members) ? members.filter(m => m.nickname && m.nickname.trim() !== "") : [];

        teamsUpdate.members = newMembers;
        teamsUpdate.leader = leader && leader.trim() !== "" ? leader.trim() : "";
        teamsUpdate.viceLeader = viceLeader && viceLeader.trim() !== "" ? viceLeader.trim() : "";
        teamsUpdate.nameTeams = nameTeams || teamsUpdate.nameTeams;
        teamsUpdate.url = newURL;
        teamsUpdate.emblema = emblema || teamsUpdate.emblema;

        await teamsUpdate.save();

        const ipAddress =
          req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        await utils.createLogger(
          `Editou a equipe`,
          userAdmin.nickname,
          teamsUpdate.nameTeams,
          ipAddress
        );

        return res.status(200).json({ msg: "Equipe atualizada com sucesso!" });
      }
      return res
        .status(422)
        .json({ error: "Ops! Parece que você não é um administrador." });
    } catch (error) {
      console.error(
        "Ops! Não foi possível atualizar a equipe ou órgão.",
        error
      );
      res
        .status(500)
        .json({ msg: "Ops! Não foi possível atualizar a equipe ou órgão." });
    }
  }
  //Função responsável por deletar uma equipe de acordo com o id params dela.
  async deleteTeams(req, res) {
    try {
      const ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const { idUser, teamsId } = req.body;
      const admin = await User.findById(idUser);
      const deleteTeam = await Teams.findById(teamsId);

      if (!deleteTeam) {
        return res
          .status(404)
          .json({ error: "Ops! Equipe ou órgão não encontrado" });
      }
      if (admin && admin.userType === "Admin" || admin.userType === "Diretor") {
        if (deleteTeam) {
          await Teams.findByIdAndDelete(deleteTeam._id);
          await utils.createLogger(
            "Excluiu a equipe",
            admin.nickname,
            deleteTeam.nameTeams,
            ipAddress
          );
          return res.status(200).json({ error: "Equipe deletada com sucesso." });
        }
      }

      return res
      .status(404)
      .json({ error: "Ops! Parece que você não é uma administrador." });
    } catch (error) {
      console.error("Não foi possível deletar a equipe", error);
      res.status(500).json({ error: "Não foi possível deletar a equipe" });
    }
  }

  // Atualizar hierarquia da equipe
  async updateHierarquia(req, res) {
    try {
      const { id } = req.params;
      const { hierarquia } = req.body;
      const team = await Teams.findByIdAndUpdate(id, { hierarquia }, { new: true });
      if (!team) return res.status(404).json({ error: 'Equipe não encontrada.' });
      res.json(team);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar hierarquia.' });
    }
  }
}
