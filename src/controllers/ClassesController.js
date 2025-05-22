import { User } from "../Models/useModel.js"
import { Classes } from "../Models/classesModel.js";
import { Requirements } from "../Models/RequirementsModel.js";
import { Teams } from "../Models/teamsModel.js";
import mongoose from "mongoose";
import { Utils } from "../utils/UserUtils.js";



const updateProfileClasse = async (id, classe) => {
  const student = await User.findById(id);
  let newClasse = student.classes;
  newClasse.push(classe);
  student.nickname = student.nickname;
  student.classes = newClasse;
  student.teans = student.teans;
  student.patent = student.patent
  student.status = student.status;
  student.tag = student.tag;
  student.warnings = student.warnings;
  student.medals = student.medals;
  student.password = student.password;
  student.userType = student.userType;
  student.save()
}

export default class ServiceControllerClasse {
  utils 
  constructor(){
    this.utils = new Utils()

  }
 
  async createClasse(req, res) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const { nameClasse, team, patent } = req.body;
      const idUser = req.idUser;
      const userAdmin = await User.findById(idUser);
      const teamsUpdate = await Teams.findOne({ nameTeams: team });

      if (!nameClasse || !team || !patent || !userAdmin) {
        return res.status(422).json({ error: "Por favor preencha todos os campos" });
      }

      const classe = await Classes.findOne({ nameClasse: nameClasse });

      if (classe) {
        return res.status(422).json({ error: "Ops! Essa aula já existe" });
      }

      if (userAdmin.userType === 'Admin' || (teamsUpdate.leader === userAdmin.nickname)) {
        const newClasse = {
          nameClasse,
          team,
          patent
        };

        const createClasse = await Classes.create(newClasse);
        await this.utils.createLogger("Criou uma nova aula", userAdmin.nickname, nameClasse, ipAddress);
        return !createClasse
          ? res.status(422).json({ error: "Houve um erro, tente novamente mais tarde" })
          : res.status(201).json({ msg: "Aula criada com sucesso." });

      } else {
        return res.status(403).json({ msg: 'Ops! Parece que você não tem permissão para editar essa aula.' });
      }


    } catch (error) {
      console.error("Erro ao criar aula.", error);
      res.status(500).json({ msg: "Erro ao criar aula." });
    }
  };

  async deleteClasse(req, res) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const { idClass } = req.body;
      const idUser = req.idUser;
      const admin = await User.findById(idUser);
      const deleteClasse = await Classes.findById(idClass)

      if (!deleteClasse) {
        return res.status(404).json({ error: 'Ops! Essa aula não foi encontrada' });
      }
      if (admin && admin.userType !== "Admin") {
        return res.status(404).json({ error: 'Ops! Parece que você não é uma administrador.' });
      }

      if (admin && admin.userType === "Admin" && deleteClasse) {
        await Classes.findByIdAndDelete(deleteClasse._id);
        await this.utils.createLogger("Excluiu a aula ", admin.nickname, deleteClasse.nameClasse, ipAddress)
        return res.status(200).json({ msg: 'Aula deletada com sucesso.' });
      }

    } catch (error) {
      console.error('Não foi possível deletar essa aula', error);
      return res.status(500).json({ error: 'Não foi possível deletar essa aula' })
    }
  };

  async postClasse(req, res) {
    try {
      const { promoted, reason, classe, team, status } = req.body;
      const idUser = req.idUser;
      const nicknameDocente = await User.findOne({ _id: idUser });
      const nicknameStudant = await User.findOne({ nickname: promoted });
      const teamDb = await Teams.findOne({ nameTeams: team });
      const classeDb = await Classes.findOne({ nameClasse: classe });
      const membersTeam = teamDb.members.some(member => member.nickname === nicknameDocente.nickname);

      if (!idUser || !promoted || !reason || !classe || !team) {
        return res.status(404).json({ error: 'Por favor preencha todos os campos solicitados' });

      } else if (!nicknameDocente || !nicknameStudant || !classeDb || !teamDb) {
        return res.status(400).json({ error: 'Dados não encontrados, por favor tente mais tarde' });

      } else if (nicknameDocente.userType === "Admin" || nicknameDocente.userType === "Diretor" || membersTeam || nicknameDocente.nickname === teamDb.leader || nicknameDocente.nickname === teamDb.viceLeader) {

        await updateProfileClasse(nicknameStudant._id, classeDb.nameClasse)

        const newRequirement = {
          promoted: nicknameStudant.nickname,
          classe: classeDb.nameClasse,
          reason,
          operator: nicknameDocente.nickname,
          team: teamDb.nameTeams,
          typeRequirement: "Aula",
          status: status || "Aprovado"
        };

        const createRequirement = await Requirements.create(newRequirement);

        if (!createRequirement) {
          return res.status(422).json({ error: 'Ops! Parece que houve um erro, tente novamente mais tarde.' });
        }

        return res.status(201).json({ msg: 'Requerimento postado com sucesso.' });


      } else {
        return res.status(403).json({ msg: 'Parece que você não tem permissão para fazer essa postagem.' });

      }

    } catch (error) {
      console.error('Erro ao postar requerimento.', error);
      res.status(500).json({ msg: 'Erro ao postar requerimento.' });
    }
  };

  async postCI(req, res) {
    try {
      const { student, reason, status } = req.body;
      const idUser = req.idUser;
      if (!idUser || !reason || !student) {
        return res.status(400).json({ error: 'Por favor preencha todos os campos solicitados' });
      }

      const nicknameDocente = await User.findOne({ _id: idUser });
      if (!nicknameDocente) {
        return res.status(404).json({ error: 'Docente não encontrado.' });
      }

      let shouldCreateUser = (status === 'Aprovado');
      if (shouldCreateUser) {
        const responseHabbo = await this.utils.connectHabbo(student.trim());
        if (responseHabbo === "error") {
          return res.status(404).json({ error: 'Este usuário não existe no Habbo Hotel' });
        }

        const nicknameUser = await User.findOne({ nickname: student });
        if (nicknameUser) {
          // Verifica se existe requerimento de Contrato ou Venda em qualquer status
          const reqRelevante = await Requirements.findOne({
            promoted: nicknameUser.nickname,
            typeRequirement: { $in: ["Contrato", "Venda"] },
            status: { $in: ["Pendente", "Aprovado", "Reprovado"] }
          });
          let response;
          if (reqRelevante) {
            // Permite a postagem passando sale=true
            response = await this.utils.RegisterContExist(nicknameUser.nickname, "Soldado", "Instrução Inicial [INS]", true);
          } else {
            response = await this.utils.RegisterContExist(nicknameUser.nickname, "Soldado", "Instrução Inicial [INS]");
          }
          if (!response.status) {
            return res.status(400).json({ error: response.info });
          }
          // Atualiza o cadastro do soldado com a tag do docente e a data atual
          const dataAtual = new Date();
          const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          const dia = String(dataAtual.getDate()).padStart(2, '0');
          const mes = meses[dataAtual.getMonth()];
          const ano = dataAtual.getFullYear();
          const dataFormatada = `${dia} de ${mes} de ${ano}`;
          nicknameUser.code = `${nicknameUser.nickname} ${nicknameDocente.tag ? `[${nicknameDocente.tag}]` : ''} ${dataFormatada}`;
          await nicknameUser.save();
        } else {
          const registered = await this.utils.register(student.trim(), "Soldado");
          if (!registered.status) {
            return res.status(422).json({ error: registered.info });
          }
          // Atualiza o cadastro do novo soldado com a tag do docente e a data atual
          const novoUser = await User.findOne({ nickname: student });
          if (novoUser) {
            const dataAtual = new Date();
            const meses = [
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const mes = meses[dataAtual.getMonth()];
            const ano = dataAtual.getFullYear();
            const dataFormatada = `${dia} de ${mes} de ${ano}`;
            novoUser.code = `${novoUser.nickname} ${nicknameDocente.tag ? `[${nicknameDocente.tag}]` : ''} ${dataFormatada}`;
            await novoUser.save();
          }
        }
      }

      // Buscar equipe do instrutor
      let equipeInstrutor = '-';
      const teamsInstrutor = await Teams.find({
        $or: [
          { leader: nicknameDocente.nickname },
          { viceLeader: nicknameDocente.nickname },
          { 'members.nickname': nicknameDocente.nickname }
        ]
      });
      if (teamsInstrutor && teamsInstrutor.length > 0) {
        // Se o instrutor faz parte de mais de uma equipe, pega a primeira (ou pode adaptar para pegar todas)
        equipeInstrutor = teamsInstrutor[0].nameTeams;
      }
      const newRequirement = {
        promoted: student,
        classe: "Instrução Inicial [INS]",
        reason,
        operator: nicknameDocente.nickname,
        team: equipeInstrutor,
        typeRequirement: "Aula",
        status: status || "Aprovado"
      };

      const createRequirement = await Requirements.create(newRequirement);
      if (!createRequirement) {
        return res.status(500).json({ error: 'Ops! Parece que houve um erro, tente novamente mais tarde.' });
      }

      return res.status(201).json({ msg: 'Requerimento postado com sucesso.' });
    } catch (error) {
      console.error('Erro ao postar requerimento.', error);
      res.status(500).json({ error: 'Erro ao postar requerimento.' });
    }
  };

  async updateClasse(req, res) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const { idClasse, nameClasse, team, patent } = req.body;
      const idUser = req.idUser;
      // Validação do ID do documento
      if (!mongoose.Types.ObjectId.isValid(idClasse)) {
        return res.status(400).json({ msg: 'ID da aula inválido.' });
      }

      if (!team) {
        return res.status(400).json({ msg: 'Ops! Por favor preencha o campo de equipe.' });
      }

      const userAdmin = await User.findById(idUser);
      const classeUpdate = await Classes.findById(idClasse);
      const teamUpdate = await Teams.findOne({ nameTeams: team });

      if (!classeUpdate || !userAdmin || !teamUpdate) {
        return res.status(404).json({ msg: 'Ops! Dados não encontrados, por favor tente mais tarde.' });
      }

      if (userAdmin.userType === 'Admin' || (teamUpdate.leader === userAdmin.nickname)) {
        classeUpdate.nameClasse = nameClasse || classeUpdate.nameClasse;
        classeUpdate.team = team || classeUpdate.team;
        classeUpdate.patent = patent || classeUpdate.patent;
        await classeUpdate.save();
        await this.utils.createLogger("Editou a aula", userAdmin.nickname, classeUpdate.nameClasse, ipAddress);
        return res.status(200).json({ msg: 'Aula atualizada com sucesso!' });
      } else {
        return res.status(403).json({ msg: 'Ops! Parece que você não tem permissão para editar essa aula.' });
      }

    } catch (error) {
      console.error('Ops! Não foi possível atualizar essa aula.', error);
      res.status(500).json({ msg: 'Ops! Não foi possível atualizar essa aula.' });
    }
  };

  async getClasses(req, res) {
    try {
      const users = await Classes.find();
      return res.json(users)

    } catch (error) {
      console.error('Aula não encontrado', error);
      res.status(500).json({ msg: 'Aula não encontrado' })
    }
  };

}




