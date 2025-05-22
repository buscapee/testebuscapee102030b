import { Logger } from '../Models/logsModel.js';
import { User } from '../Models/useModel.js';
import { DocsSystem } from '../Models/docsModel.js';
import { InfoSystem } from '../Models/systemModel.js';
import { Teams } from '../Models/teamsModel.js';
import bcrypt from 'bcryptjs'

const apiHabbo = `https://www.habbo.com.br/api/public/users?name=`

export class Utils {
  // Conecta com a api de usuário do habbo
  async connectHabbo(nick) {
    try {
      const res = await fetch(`${apiHabbo}${nick}`, {
        method: 'GET'
      });
      const data = await res.json();
      return data.error ? 'error' : data;
    } catch (error) {
      console.log(error);
      return 'error';
    }
  };

  //Registra o a ação e o IP do usuário
  async createLogger(action, user, name, ip) {
    const newLogger = {
      user: user,
      ip: ip,
      loggerType: `${action} ${name}`
    }

    if (user === "DMESystem") {
      return
    }

    return await Logger.create(newLogger);
  };

  //Armazena o Token atual no banco de dados
  async tokenActiveDb(nickname, token) {
    const user = await User.findOne({ nickname: nickname })
    if (user) {
      user.tokenActive = token;
      await user.save();  // Salva o documento do usuário, não o modelo
    } else {
      throw new Error('Usuário não encontrado');
    }
  }

  //Cria um novo usuário no system
  async register(nick, patent) {
    try {
      const passwordConf = `${process.env.USER_PASS_REGISTER}`
      const nickname = await User.findOne({ nickname: nick.trim() });

      if (nickname && (nickname.status === "Exonerado" || nickname.status === "Banido")) {
        return {
          info: "Ops! Este usuário encontra-se banido ou exonerado.",
          status: false
        };
      } else if (nickname && (nickname.status === "Ativo" || nickname.status === "Pendente")) {
        return {
          info: "Ops! Este usuário encontra-se no quadro de funcionários do Departamento Militar de Elite",
          status: false
        };
      } else {
        const saltHash = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordConf, saltHash);

        const newUserdb = {
          nickname: nick.trim(),
          password: passwordHash,
          patent: patent,
          classes: "Instrução Inicial [INS]",
          teans: 'System',
          status: 'Pendente',
          tag: 'Vazio',
          warnings: 0,
          medals: 0,
          userType: 'User',
          code: ''
        };

        const createUser = await User.create(newUserdb);
        return createUser
          ? {
            info: "Usuário cadastrado com sucesso.",
            status: true
          }
          : {
            info: "Houve um erro, tente novamente mais tarde",
            status: false
          };
      }
    } catch (error) {
      console.error("Erro ao registrar", error);
      return {
        info: "Erro ao efetuar cadastro",
        status: false
      };
    }
  }

  //Atualiza conta do usuário caso ela exista na postagem de algum requerimento
  async RegisterContExist(nickname, patent, classes, sale) {
    try {
      console.log('Iniciando processo de registro...');
      const passwordConf = `${process.env.USER_PASS_REGISTER}`
      console.log('Buscando usuário com nickname:', nickname);
      const cont = await User.findOne({ nickname: nickname });

      if (!cont) {
        console.log('Usuário não encontrado.');
        return {
          info: `Usuário não encontrado.`,
          status: false
        };

      } else {
        console.log('Usuário encontrado:', cont);

        if (cont.status === "Banido" || cont.status === "Exonerado") {
          console.log('Usuário está exonerado ou é funcionário ativo do Departamento Militar de Elite.');
          return {
            info: `Esse usuário está exonerado ou ativo no Departamento Militar de Elite.`,
            status: false
          };
        } else if (cont.patent !== "Civil" && !sale) {
          console.log('Usuário está exonerado ou é funcionário ativo do Departamento Militar de Elite.');
          return {
            info: `Esse usuário está exonerado ou ativo no Departamento Militar de Elite.`,
            status: false
          };
        } else {

          const saltHash = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(passwordConf, saltHash);

          cont.nickname = cont.nickname;
          cont.classes = classes.length > 0 ? cont.classes : classes;
          cont.teans = "System";
          cont.patent = patent;
          cont.status = "Pendente";
          cont.tokenActive = "";
          cont.tag = "Vazio";
          cont.warnings = 0;
          cont.medals = 0;
          cont.password = passwordHash;
          cont.userType = "User";
          await cont.save();

          console.log('Usuário atualizado com sucesso.');
          return {
            info: 'Usuário atualizado com sucesso.',
            status: true
          };

        }

      }

    } catch (error) {
      console.error('Não foi possível atualizar o usuário.', error);
      return {
        info: 'Não foi possível atualizar o usuário.',
        status: false
      };
    }
  }

  //Verifica se o usuário é diretor
  async isDiretor(diretor) {
    const info = await InfoSystem.findOne();

    const isValidado = info.patents.includes(diretor) ?
      info.patents.indexOf(diretor) :
      info.paidPositions.indexOf(diretor);
    return isValidado >= 14 ? true : false;

  };

  //Verifica se um usuário é superior a outro
  async isSuperior(higher, subordinate, type, patentContract, req, res) {
    let userAdmin = false;
    if (req) {
      userAdmin = await User.findOne({ _id: req.idUser })
    }

    const info = await InfoSystem.findOne();
    const diretor = await this.isDiretor(higher);

    if (!info || !info.patents) {
      return res.status(500).json({ msg: 'Informações do sistema não encontradas.' });
    }

    const patentOperadorIndex = info.patents.includes(higher.patent) ?
      info.patents.indexOf(higher.patent) :
      info.paidPositions.indexOf(higher.patent);

    const patentPromotedIndex = info.patents.includes(!patentContract ? subordinate.patent : patentContract) ?
      info.patents.indexOf(!patentContract ? subordinate.patent : patentContract) :
      info.paidPositions.indexOf(!patentContract ? subordinate.patent : patentContract);

    const indexRealOperator = patentOperadorIndex - 2;
    if (patentPromotedIndex <= indexRealOperator || diretor === true || userAdmin.userType === "Admin") {

      let newIndexPatent;
      let newPatent;

      switch (type) {
        case "Promoção":
          newIndexPatent = patentPromotedIndex + 1;
          newPatent = info.patents.includes(subordinate.patent) ? info.patents[newIndexPatent] : info.paidPositions[newIndexPatent];
          break;

        case "Rebaixamento":
          newIndexPatent = patentPromotedIndex - 1;
          if (info.patents.includes(subordinate.patent)) {
            newPatent = newIndexPatent >= 0 ? info.patents[newIndexPatent] : info.patents[0];
          } else {
            newPatent = newIndexPatent >= 0 ? info.paidPositions[newIndexPatent] : info.paidPositions[0];
          }
          break;

        case "Demissão":
          newPatent = "Civil";
          break;

        case "Advertência":
          newPatent = null;
          break;

        case "Contrato":
          newPatent = patentContract;
          break;

        default:
          return res.status(400).json({ msg: "Tipo de operação não reconhecido." });
      }

      return {
        isSuperior: true,
        newPatent: newPatent
      };
    } else {
      return {
        isSuperior: false,
        newPatent: newPatent
      };
    }
  };

  async getInfos() {
    const docs = await DocsSystem.countDocuments();
    const users = await User.countDocuments({ status: { $in: ['Ativo', 'Pendente'] } });
    const usersTotal = await User.countDocuments();
    const teams = await Teams.countDocuments();

    return {
      docs,
      users,
      usersTotal,
      teams,
    }
  };

  async updateProfile(nickname, team) {
    const userMember = await User.findOne({ nickname: nickname });

    if (!userMember) {
      console.error(`User with nickname ${nickname} not found.`);
      return; // Ou lançar um erro, dependendo de como você quer lidar com isso
    }

    console.log(userMember);

    let newTeams = userMember.teans || []; // Corrigir a propriedade de teans para teams
    newTeams.push(team);

    userMember.teans = newTeams;

    // Não é necessário redefinir todas as outras propriedades se não estiverem sendo alteradas
    await userMember.save();
  };

  getCurrentDate() {
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `${day} de ${month} de ${year}`;
  };

  dataSeisDiasAtras() {
    const hoje = new Date();
    hoje.setDate(hoje.getDate() - 7);
    // Retorna a data formatada como string (opcional)
    // Aqui, você pode escolher o formato desejado. Este exemplo retorna a data no formato ISO (YYYY-MM-DD)
    const dataFormatada = hoje.toISOString().split()[0];
    return dataFormatada;
  };

  createURL(url) {
    let newURL = url.normalize("NFD") 
                    .replace(/[\u0300-\u036f]/g, "") 
                    .replace(/ /g, "-") 
                    .toLowerCase(); 
    return newURL;
}


}