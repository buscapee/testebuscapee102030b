import { User } from "../Models/useModel.js";
import { Requirements } from "../Models/RequirementsModel.js";
import { InfoSystem } from "../Models/systemModel.js";
import { Utils } from "../utils/UserUtils.js";
import { Teams } from "../Models/teamsModel.js";

const utils = new Utils();

export default class ServiceControllerRequirements {
  async createRequirements(req, res) {
    try {
      const { promoted, reason, permissor, anexoProvas } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const nicknamePromoted = await User.findOne({ nickname: promoted });
      const validateSuperior = await utils.isSuperior(
        nicknameOperator,
        nicknamePromoted,
        "Promoção",
      );
      const validete = await utils.isDiretor(nicknameOperator.patent);

      if (
        validateSuperior.isSuperior === true ||
        nicknameOperator.userType === "Admin" ||
        validete === true
      ) {
        const newRequirement = {
          promoted,
          newPatent: validateSuperior.newPatent,
          newMotto: `${promoted} [${nicknameOperator.tag}] ${utils.getCurrentDate()}`,
          reason,
          patentOperador: nicknameOperator.patent,
          operator: nicknameOperator.nickname,
          typeRequirement: "Promoção",
          status: "Pendente",
          oldPatent: nicknamePromoted.patent,
          permissor,
          anexoProvas,
        };

        const createRequirement = await Requirements.create(newRequirement);

        if (!createRequirement) {
          return res
            .status(422)
            .json({
              error:
                "Ops! Parece que houve um erro, tente novamente mais tarde.",
            });
        }

        return res
          .status(201)
          .json({ msg: "Requerimento postado com sucesso." });
      }
      return res
        .status(422)
        .json({
          error: "Ops! Você não tem permissão para promover esse usuário",
        });
    } catch (error) {
      console.error("Erro ao postar requerimento.", error);
      res.status(500).json({ msg: "Erro ao postar requerimento." });
    }
  }

  async createRequirementsRelegation(req, res) {
    try {
      const { promoted, reason, permissor, anexoProvas } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const nicknameRelegation = await User.findOne({ nickname: promoted });
      const validete = await utils.isDiretor(nicknameOperator.patent);
      const validateSuperior = await utils.isSuperior(
        nicknameOperator,
        nicknameRelegation,
        "Rebaixamento",
      );

      if (
        validateSuperior.isSuperior === true ||
        nicknameOperator.userType === "Admin" ||
        validete === true
      ) {
        const newRequirement = {
          promoted,
          newPatent: validateSuperior.newPatent,
          newMotto: `${promoted} [${nicknameOperator.tag}] ${utils.getCurrentDate()}`,
          reason,
          patentOperador: nicknameOperator.patent,
          operator: nicknameOperator.nickname,
          typeRequirement: "Rebaixamento",
          status: "Pendente",
          oldPatent: nicknameRelegation.patent,
          permissor,
          anexoProvas,
        };

        const createRequirement = await Requirements.create(newRequirement);

        if (!createRequirement) {
          return res
            .status(422)
            .json({
              error:
                "Ops! Parece que houve um erro, tente novamente mais tarde.",
            });
        }

        // Atualiza o cargo do usuário imediatamente (opcional, se quiser só ao aprovar, remova este bloco)
        // nicknameRelegation.patent = validateSuperior.newPatent;
        // await nicknameRelegation.save();

        // Adiciona na timeline do usuário (se houver campo timeline, senão, apenas salva o requerimento)
        // if (nicknameRelegation.timeline) {
        //     nicknameRelegation.timeline.push({
        //         tipo: "Rebaixamento",
        //         patente: validateSuperior.newPatent,
        //         data: new Date(),
        //         status: "Pendente"
        //     });
        //     await nicknameRelegation.save();
        // }

        return res
          .status(201)
          .json({ msg: "Requerimento postado com sucesso." });
      }
      return res
        .status(422)
        .json({
          error:
            "Ops! Você não tem permissão para rebaixar esse usuário reporte o caso para algum superior",
        });
    } catch (error) {
      console.error("Erro ao postar requerimento.", error);
      res.status(500).json({ msg: "Erro ao postar requerimento." });
    }
  }

  async createRequirementsWarning(req, res) {
    try {
      const { promoted, reason, permissor, anexoProvas } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const nicknameRelegation = await User.findOne({ nickname: promoted });

      const validateSuperior = await utils.isSuperior(
        nicknameOperator,
        nicknameRelegation,
        "Advertência",
      );
      const validete = await utils.isDiretor(nicknameOperator.patent);

      if (
        validateSuperior.isSuperior === true ||
        nicknameOperator.userType === "Admin" ||
        validete === true
      ) {
        const newRequirement = {
          promoted,
          newPatent: nicknameRelegation.patent,
          reason,
          patentOperador: nicknameOperator.patent,
          operator: nicknameOperator.nickname,
          typeRequirement: "Advertência",
          status: "Pendente",
          permissor,
          anexoProvas,
        };

        const createRequirement = await Requirements.create(newRequirement);

        if (!createRequirement) {
          return res
            .status(422)
            .json({
              error:
                "Ops! Parece que houve um erro, tente novamente mais tarde.",
            });
        }

        return res
          .status(201)
          .json({ msg: "Requerimento postado com sucesso." });
      }

      return res
        .status(422)
        .json({
          error:
            "Ops! Você não tem permissão para adverter esse usuário reporte o caso para algum superior",
        });
    } catch (error) {
      console.error("Erro ao postar requerimento.", error);
      res.status(500).json({ msg: "Erro ao postar requerimento." });
    }
  }

  async createRequirementsResignation(req, res) {
    try {
      const { promoted, reason, permissor, anexoProvas } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const nicknameRelegation = await User.findOne({ nickname: promoted });

      if (nicknameRelegation.status === "Demissão") {
        return res
          .status(404)
          .json({
            msg: "Ops! Este usuário não se encontra no quadro de funcionários.",
          });
      }

      const validateSuperior = await utils.isSuperior(
        nicknameOperator,
        nicknameRelegation,
        "Demissão",
      );
      const validete = await utils.isDiretor(nicknameOperator.patent);
      if (
        validateSuperior.isSuperior === true ||
        nicknameOperator.userType === "Admin" ||
        validete === true
      ) {
        const newRequirement = {
          promoted,
          newPatent: "Civil",
          newMotto: `${promoted} [${nicknameOperator.tag}] ${utils.getCurrentDate()}`,
          reason,
          patentOperador: nicknameOperator.patent,
          operator: nicknameOperator.nickname,
          typeRequirement: "Demissão",
          status: "Pendente",
          oldPatent: nicknameRelegation.patent,
          permissor,
          anexoProvas,
        };

        const createRequirement = await Requirements.create(newRequirement);

        if (!createRequirement) {
          return res
            .status(422)
            .json({
              error:
                "Ops! Parece que houve um erro, tente novamente mais tarde.",
            });
        }

        return res
          .status(201)
          .json({ msg: "Requerimento postado com sucesso." });
      }

      return res
        .status(422)
        .json({
          error:
            "Ops! Você não tem permissão para adverter esse usuário reporte o caso para algum superior",
        });
    } catch (error) {
      console.error("Erro ao postar requerimento.", error);
      res.status(500).json({ msg: "Erro ao postar requerimento." });
    }
  }

  async ResignationUpdateUser(req, res) {
    try {
      const { idUser } = req.body;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const requirements = await Requirements.find({
        operator: nicknameOperator.nickname,
      });
      const post = requirements.slice(-1)[0];

      const nickname = await User.findOne({ nickname: post.promoted });

      if (!nickname) {
        res.status(404).json({ msg: "Ops! Usuário não encontrado." });
      } else {
        // Só altera se o requerimento estiver aprovado
        if (post.status === "Aprovado") {
          nickname.nickname = post.promoted;
          nickname.patent = post.newPatent;
          nickname.classes = "";
          nickname.teans = "";
          nickname.status = "Desativado";
          nickname.tag = "Vazio";
          nickname.warnings = "0";
          nickname.medals = "0";
          nickname.password = nickname.password;
          nickname.userType = "User";

          // Remover usuário de todas as equipes
          const teams = await Teams.find({
            $or: [
              { leader: nickname.nickname },
              { viceLeader: nickname.nickname },
              { "members.nickname": nickname.nickname },
            ],
          });

          for (const team of teams) {
            // Remove de membros
            team.members = team.members.filter(
              (m) => m.nickname !== nickname.nickname,
            );
            // Remove de liderança
            if (team.leader === nickname.nickname) team.leader = null;
            if (team.viceLeader === nickname.nickname) team.viceLeader = null;
            await team.save();
          }

          // Limpar o array de equipes do usuário
          nickname.teans = [];
          await nickname.save();
          res.status(200).json({ msg: "Usuário atualizado com sucesso" });
        } else {
          res
            .status(200)
            .json({
              msg: "Requerimento não aprovado. Nenhuma alteração feita.",
            });
        }
      }
    } catch (error) {
      console.error("Não foi possível atualizar o usuário.", error);
      res.status(500).json({ msg: "Não foi possível atualizar o usuário." });
    }
  }

  async createContract(req, res) {
    try {
      const { promoted, patent, reason } = req.body;
      const idUser = req.idUser;
      // Procurar o operador pelo idUser
      const nicknameOperator = await User.findOne({ _id: idUser });
      if (!nicknameOperator) {
        return res.status(404).json({ error: "Operador não encontrado" });
      }

      // Procurar o usuário promovido pelo nickname
      const nicknameRelegation = await User.findOne({ nickname: promoted });

      // Conectar ao Habbo para verificar a existência do usuário
      const responseHabbo = await utils.connectHabbo(promoted.trim());
      if (responseHabbo === "error") {
        return res
          .status(404)
          .json({ error: "Este usuário não existe no Habbo Hotel" });
      }

      // Validar se o operador tem permissão para contratar o usuário promovido
      const validateSuperior = await utils.isSuperior(
        nicknameOperator,
        nicknameRelegation,
        "Contrato",
        patent,
        req,
      );
      if (validateSuperior === false) {
        return res
          .status(422)
          .json({
            error:
              "Ops! Você não tem permissão para contratar esse usuário. Reporte o caso para algum superior.",
          });
      }

      // Verificar se o usuário promovido já está registrado
      if (nicknameRelegation) {
        const response = await utils.RegisterContExist(
          nicknameRelegation.nickname,
          patent,
          " ",
        );
        if (response.status === false) {
          return res.status(400).json({ error: response.info });
        }
      } else {
        // Registrar novo usuário se não estiver registrado
        const registrered = await utils.register(promoted.trim(), patent);
        if (registrered.status === false) {
          return res.status(422).json({ error: registrered.info });
        }
      }

      // Criar novo requisito de contrato
      const newRequirement = {
        promoted,
        newPatent: patent,
        newMotto: `${promoted} [${nicknameOperator.tag}] ${utils.getCurrentDate()}`,
        reason,
        patentOperador: nicknameOperator.patent,
        operator: nicknameOperator.nickname,
        typeRequirement: "Contrato",
        status: "Pendente",
      };

      // Salvar o requisito no banco de dados
      const resRequeriment = await Requirements.create(newRequirement);
      return !resRequeriment
        ? res
            .status(422)
            .json({ error: "Houve um erro, tente novamente mais tarde" })
        : res.status(201).json({ msg: "Contrato efetuado com sucesso." });
    } catch (error) {
      console.error("Erro ao registrar", error);
      res.status(500).json({ msg: "Erro ao efetuar cadastro" });
    }
  }

  async createSales(req, res) {
    try {
      const { promoted, patent, reason, price } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const nicknameRelegation = await User.findOne({ nickname: promoted });
      const info = await InfoSystem.findOne();

      if (!info || !info.patents || !info.paidPositions) {
        return res
          .status(500)
          .json({ msg: "Informações do sistema não encontradas." });
      }
      if (nicknameRelegation) {
        utils.RegisterContExist(promoted, patent, false, true);
      } else {
        await utils.register(promoted, patent);
      }

      const validete = await utils.isDiretor(nicknameOperator.patent);

      if (nicknameOperator.userType === "Admin" || validete === true) {
        const newRequirement = {
          promoted,
          newPatent: patent,
          newMotto: `${promoted} [${nicknameOperator.tag}] ${utils.getCurrentDate()}`,
          reason,
          patentOperador: nicknameOperator.patent,
          operator: nicknameOperator.nickname,
          price,
          typeRequirement: "Venda",
          status: "Pendente",
        };

        const newSale = await Requirements.create(newRequirement);
        return !newSale
          ? res
              .status(422)
              .json({ error: "Houve um erro, tente novamente mais tarde" })
          : res.status(201).json({ msg: "Venda efetuada com sucesso." });
      }
      return res
        .status(422)
        .json({ error: "Ops! Você não tem permissão para vender cargo " });
    } catch (error) {
      console.error("Erro ao registrar", error);
      res.status(500).json({ msg: "Erro ao efetuar cadastro" });
    }
  }

  async getAllRequirementsPromoteds(req, res) {
    try {
      const statusRequirement = req.query.statusRequirement;
      const typeRequirement = req.query.typeRequirement;
      const requirements = await Requirements.find({
        typeRequirement: typeRequirement,
      });

      if (statusRequirement) {
        const filteredRequirements = requirements.filter((objeto) => {
          return objeto.status === statusRequirement;
        });
        return res.json(filteredRequirements);
      }

      return res.json(requirements);
    } catch (error) {
      console.error("Erro ao obter os requisitos:", error);
      res.status(500).json({ msg: "Erro ao obter os requisitos" });
    }
  }

  async getAllRequirementsTeams(req, res) {
    try {
      const teamRequirement = req.query.teamRequirement;
      const page = parseInt(req.query.page) || 1; // Página atual (padrão: 1)
      const limit = parseInt(req.query.limit) || 10; // Limite de itens por página (padrão: 10)
      const skip = (page - 1) * limit; // Quantidade de itens a pular

      // Encontrar e paginar os requisitos
      const requirements = await Requirements.find({ team: teamRequirement })
        .sort({ _id: -1 }) // Ordenar em ordem decrescente pelo campo _id
        .skip(skip)
        .limit(limit);

      // Obter o total de requisitos para a equipe
      const totalRequirements = await Requirements.countDocuments({
        team: teamRequirement,
      });

      // Calcular o total de páginas
      const totalPages = Math.ceil(totalRequirements / limit);

      // Enviar a resposta paginada
      return res.json({
        requirements,
        currentPage: page,
        totalPages: totalPages,
        totalRequirements: totalRequirements,
      });
    } catch (error) {
      console.error("Erro ao obter os requisitos:", error);
      res.status(500).json({ msg: "Erro ao obter os requisitos" });
    }
  }

  async searchRequeriments(req, res) {
    try {
      const nameRequeriment = req.query.promoted;
      const Requirement = await Requirements.find({
        promoted: nameRequeriment,
      });
      res.json(Requirement);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async createRequirementsGratification(req, res) {
    try {
      const { operator, gratified, amount, reason } = req.body;
      const newRequirement = {
        operator,
        promoted: gratified,
        amount,
        reason,
        typeRequirement: "Gratificação",
        status: "Pendente",
      };
      const createRequirement = await Requirements.create(newRequirement);
      if (!createRequirement) {
        return res.status(422).json({ error: "Erro ao criar gratificação." });
      }
      return res.status(201).json({ msg: "Gratificação postada com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar gratificação." });
    }
  }

  // Função utilitária para adicionar log
  async addLog(requirement, user, action) {
    requirement.logs = requirement.logs || [];
    requirement.logs.push({
      user: user.nickname,
      action,
      date: new Date(),
      type: requirement.typeRequirement,
    });
    await requirement.save();
  }

  async editRequirementData(req, res) {
    try {
      const {
        idRequirements,
        promoted,
        reason,
        newPatent,
        createdAt,
        status,
        crhAnalysis,
      } = req.body;
      const idUser = req.idUser;
      const user = await User.findOne({ _id: idUser });
      if (
        !user ||
        !["Admin", "Diretor", "Recursos Humanos"].includes(user.userType)
      ) {
        return res
          .status(403)
          .json({ msg: "Sem permissão para editar requerimento." });
      }
      const requirement = await Requirements.findById(idRequirements);
      if (!requirement) {
        return res.status(404).json({ msg: "Requerimento não encontrado." });
      }
      if (promoted) requirement.promoted = promoted;
      if (reason) requirement.reason = reason;
      if (newPatent) requirement.newPatent = newPatent;
      if (createdAt) requirement.createdAt = new Date(createdAt);
      if (status) requirement.status = status;
      if (crhAnalysis !== undefined) requirement.crhAnalysis = crhAnalysis;
      await requirement.save();

      // Atualizar a patente do usuário promovido para oldPatent se for promoção, rebaixamento ou demissão reprovada
      if (
        ["Promoção", "Rebaixamento", "Demissão"].includes(
          requirement.typeRequirement,
        ) &&
        status === "Reprovado"
      ) {
        const userPromoted = await User.findOne({
          nickname: requirement.promoted,
        });
        if (userPromoted && requirement.oldPatent) {
          userPromoted.patent = requirement.oldPatent;
          await userPromoted.save();
        }
      }

      await this.addLog(requirement, user, "editou");
      return res.status(200).json({ msg: "Requerimento editado com sucesso." });
    } catch (error) {
      console.error("Erro ao editar requerimento:", error);
      res.status(500).json({ msg: "Erro ao editar requerimento." });
    }
  }

  // Adicionar rota para buscar requerimento por ID (com logs)
  async getRequirementById(req, res) {
    try {
      const { id } = req.params;
      const requirement = await Requirements.findById(id);
      if (!requirement)
        return res.status(404).json({ error: "Requerimento não encontrado" });
      res.json(requirement);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar requerimento" });
    }
  }

  async createRequirementsExoneration(req, res) {
    try {
      const { envolvido, banidoAte, anexoProvas, observacao, aplicador } =
        req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const nicknameExonerado = await User.findOne({ nickname: envolvido });

      if (!nicknameOperator || !nicknameExonerado) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      // Permissão: Admin, Diretor ou RH
      if (
        ["Admin", "Diretor", "Recursos Humanos"].includes(
          nicknameOperator.userType,
        )
      ) {
        const newRequirement = {
          promoted: envolvido,
          reason: observacao,
          operator: aplicador || nicknameOperator.nickname,
          typeRequirement: "Exoneração",
          status: "Pendente",
          anexoProvas,
          banidoAte,
        };
        const createRequirement = await Requirements.create(newRequirement);
        if (!createRequirement) {
          return res
            .status(422)
            .json({
              error:
                "Ops! Parece que houve um erro, tente novamente mais tarde.",
            });
        }
        return res
          .status(201)
          .json({ msg: "Exoneração registrada com sucesso." });
      }
      return res
        .status(403)
        .json({ error: "Você não tem permissão para exonerar este usuário." });
    } catch (error) {
      console.error("Erro ao registrar exoneração.", error);
      res.status(500).json({ msg: "Erro ao registrar exoneração." });
    }
  }

  async createRequirementsPermission(req, res) {
    try {
      const { authorized, promoted, reason } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });

      if (!nicknameOperator) {
        return res.status(404).json({ error: "Aplicador não encontrado." });
      }

      const newRequirement = {
        operator: nicknameOperator.nickname,
        authorized,
        promoted,
        reason,
        typeRequirement: "Permissão",
        status: "Pendente",
      };

      const createRequirement = await Requirements.create(newRequirement);

      if (!createRequirement) {
        return res.status(422).json({ error: "Erro ao criar permissão." });
      }

      return res.status(201).json({ msg: "Permissão registrada com sucesso." });
    } catch (error) {
      console.error("Erro ao criar permissão:", error);
      res.status(500).json({ error: "Erro ao criar permissão." });
    }
  }

  async createCadet(req, res) {
    try {
      const { promoted, reason } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      if (!nicknameOperator) {
        return res.status(404).json({ error: "Operador não encontrado" });
      }
      // Verificar se o usuário promovido já está registrado
      let nicknameRelegation = await User.findOne({ nickname: promoted });
      if (!nicknameRelegation) {
        // Registrar novo usuário se não estiver registrado
        const registered = await utils.register(promoted.trim(), "Cadete");
        if (registered.status === false) {
          return res.status(422).json({ error: registered.info });
        }
        nicknameRelegation = await User.findOne({ nickname: promoted });
      }
      // Criar novo requerimento de cadete
      const newRequirement = {
        promoted,
        newPatent: "Cadete",
        reason,
        operator: nicknameOperator.nickname,
        typeRequirement: "Cadete",
        status: "Pendente",
      };
      const resRequeriment = await Requirements.create(newRequirement);
      await utils.createLogger(
        "Criou requerimento de cadete",
        nicknameOperator.nickname,
        promoted,
        req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      );
      return !resRequeriment
        ? res
            .status(422)
            .json({ error: "Houve um erro, tente novamente mais tarde" })
        : res
            .status(201)
            .json({ msg: "Requerimento de cadete efetuado com sucesso." });
    } catch (error) {
      console.error("Erro ao registrar cadete", error);
      res.status(500).json({ msg: "Erro ao efetuar cadastro de cadete" });
    }
  }

  async updateCadet(req, res) {
    try {
      const { idRequirements, promoted, reason, statusRequirements, crhAnalysis } = req.body;
      const idUser = req.idUser;
      const admin = await User.findById(idUser);
      const reqCadet = await Requirements.findById(idRequirements);
      if (!admin || !reqCadet) {
        return res.status(404).json({ error: "Dados não encontrados." });
      }
      if (promoted) reqCadet.promoted = promoted;
      if (reason) reqCadet.reason = reason;
      if (statusRequirements) reqCadet.status = statusRequirements;
      if (crhAnalysis !== undefined) reqCadet.crhAnalysis = crhAnalysis;
      await reqCadet.save();
      await utils.createLogger(
        "editou",
        admin.nickname,
        reqCadet.typeRequirement,
        req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      );
      return res
        .status(200)
        .json({ msg: "Requerimento de cadete atualizado com sucesso." });
    } catch (error) {
      console.error("Erro ao atualizar requerimento de cadete", error);
      res.status(500).json({ msg: "Erro ao atualizar requerimento de cadete" });
    }
  }

  async deleteCadet(req, res) {
    try {
      const { idRequirements } = req.body;
      const idUser = req.idUser;
      const admin = await User.findById(idUser);
      const reqCadet = await Requirements.findById(idRequirements);
      if (!admin || !reqCadet) {
        return res.status(404).json({ error: "Dados não encontrados." });
      }
      await Requirements.findByIdAndDelete(idRequirements);
      await utils.createLogger(
        "Excluiu requerimento de cadete",
        admin.nickname,
        reqCadet.promoted,
        req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      );
      return res
        .status(200)
        .json({ msg: "Requerimento de cadete excluído com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir requerimento de cadete", error);
      res.status(500).json({ msg: "Erro ao excluir requerimento de cadete" });
    }
  }

  async createTransfer(req, res) {
    try {
      const { transferido, patent, reason, nickNovo, tipoTransferencia } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      if (!nicknameOperator) {
        return res.status(404).json({ error: "Operador não encontrado" });
      }
      // Verificar se o usuário transferido existe
      const nicknameTransferido = await User.findOne({ nickname: transferido });
      if (!nicknameTransferido) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      // Criar novo requerimento de transferência
      const newRequirement = {
        promoted: transferido,
        transferido: transferido,
        patent,
        reason,
        nickNovo: nickNovo || "",
        tagNova: req.body.tagNova || "",
        tipoTransferencia: tipoTransferencia || "Transferência de Conta",
        operator: nicknameOperator.nickname,
        typeRequirement: "Transferência",
        status: "Pendente",
      };
      const resRequeriment = await Requirements.create(newRequirement);
      await utils.createLogger(
        "Criou requerimento de transferência",
        nicknameOperator.nickname,
        transferido,
        req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      );
      return !resRequeriment
        ? res
            .status(422)
            .json({ error: "Houve um erro, tente novamente mais tarde" })
        : res
            .status(201)
            .json({ msg: "Requerimento de transferência efetuado com sucesso." });
    } catch (error) {
      console.error("Erro ao registrar transferência", error);
      res.status(500).json({ msg: "Erro ao efetuar cadastro de transferência" });
    }
  }

  async updateTransfer(req, res) {
    try {
      const { idRequirements, transferido, patent, reason, statusRequirements, nickNovo, tagNova, tipoTransferencia } = req.body;
      const idUser = req.idUser;
      const admin = await User.findById(idUser);
      const reqTransfer = await Requirements.findById(idRequirements);
      if (!admin || !reqTransfer) {
        return res.status(404).json({ error: "Dados não encontrados." });
      }
      if (transferido) reqTransfer.transferido = transferido;
      if (patent) reqTransfer.patent = patent;
      if (reason) reqTransfer.reason = reason;
      if (statusRequirements) reqTransfer.status = statusRequirements;
      if (nickNovo !== undefined) reqTransfer.nickNovo = nickNovo;
      if (tagNova !== undefined) reqTransfer.tagNova = tagNova;
      if (tipoTransferencia !== undefined) reqTransfer.tipoTransferencia = tipoTransferencia;
      await reqTransfer.save();
      // Adiciona log de ação (aprovou/reprovou/atualizou)
      const action = statusRequirements === 'Aprovado' ? 'aceitou' : (statusRequirements === 'Reprovado' ? 'reprovou' : 'editou');
      await this.addLog(reqTransfer, admin, action);
      return res
        .status(200)
        .json({ msg: "Requerimento de transferência atualizado com sucesso." });
    } catch (error) {
      console.error("Erro ao atualizar requerimento de transferência", error);
      res.status(500).json({ msg: "Erro ao atualizar requerimento de transferência" });
    }
  }

  async deleteTransfer(req, res) {
    try {
      const { idRequirements } = req.body;
      const idUser = req.idUser;
      const admin = await User.findById(idUser);
      const reqTransfer = await Requirements.findById(idRequirements);
      if (!admin || !reqTransfer) {
        return res.status(404).json({ error: "Dados não encontrados." });
      }
      await Requirements.findByIdAndDelete(idRequirements);
      await utils.createLogger(
        "Excluiu requerimento de transferência",
        admin.nickname,
        reqTransfer.transferido,
        req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      );
      return res
        .status(200)
        .json({ msg: "Requerimento de transferência excluído com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir requerimento de transferência", error);
      res.status(500).json({ msg: "Erro ao excluir requerimento de transferência" });
    }
  }
}
