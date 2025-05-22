import { User } from '../Models/useModel.js';
import { Requirements } from '../Models/RequirementsModel.js';
import ServiceControllerRequirements from "./Requirements.js";
import { InfoSystem } from '../Models/systemModel.js';

export default class ServiceControllerRh{
  //Função para aprovar ou reprovar requerimentos:
  async editRequeriment(req, res){
    try {
      const { idRequirements, statusRequirements } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const requirement = await Requirements.findById(idRequirements);
      const requirementsController = new ServiceControllerRequirements();
      if (!requirement || !nicknameOperator) {
        return res.status(404).json({ msg: 'Ops! Usuário ou requerimento não encontrado.' });
      }
      // Permissão
      if (nicknameOperator && (nicknameOperator.userType === "Admin" || nicknameOperator.userType === "Recursos Humanos" || nicknameOperator.userType === "Diretor")) {
        // Se for Permissão, apenas atualiza o status e salva
        if (requirement.typeRequirement === "Permissão") {
          requirement.status = statusRequirements;
          await requirement.save();
          await requirementsController.addLog(requirement, nicknameOperator, statusRequirements === 'Aprovado' ? 'aceitou' : 'negou');
          return res.status(200).json({ msg: `Permissão ${statusRequirements} com sucesso.` });
        }
        // Se for gratificação, só atualiza status e, se aprovado, soma medals
        if (requirement.typeRequirement === "Gratificação") {
          requirement.status = statusRequirements;
          if (statusRequirements === "Aprovado") {
            const user = await User.findOne({ nickname: requirement.promoted });
            if (user) {
              user.medals = (user.medals || 0) + (requirement.amount || 0);
              await user.save();
            }
          }
          await requirement.save();
          // Adiciona log de ação
          await requirementsController.addLog(requirement, nicknameOperator, statusRequirements === 'Aprovado' ? 'aceitou' : 'negou');
          return res.status(200).json({ msg: `Requerimento ${statusRequirements} com sucesso.` });
        }
        // Se for Exoneração, apenas atualiza status e salva
        if (requirement.typeRequirement === "Exoneração") {
          requirement.status = statusRequirements;
          await requirement.save();
          if (statusRequirements === "Aprovado") {
            // Adiciona o exonerado ao array exonereds do sistema
            const system = await InfoSystem.findOne({ name: /DME/i });
            if (system && !system.exonereds.includes(requirement.promoted)) {
              system.exonereds.push(requirement.promoted);
              await system.save();
            }
            // Atualiza o usuário: desativa e muda a patente para 'Exonerado'
            const user = await User.findOne({ nickname: requirement.promoted });
            if (user) {
              user.active = false;
              user.patent = "Exonerado";
              user.status = "Exonerado";
              user.medals = 0;
              user.warnings = 0;
              user.emblemas = [];
              user.emblemasExibidos = [];
              user.bannersExibidos = [];
              await user.save();
            }
          }
          await requirementsController.addLog(requirement, nicknameOperator, statusRequirements === 'Aprovado' ? 'aceitou' : 'reprovou');
          return res.status(200).json({ message: "Status atualizado com sucesso!" });
        }
        // Se for Demissão, atualiza status e reseta informações se aprovado
        if (requirement.typeRequirement === "Demissão") {
          // Sempre atualiza o status do requerimento
          requirement.status = statusRequirements;
          await requirement.save();
          // Só executa as ações no usuário se for aprovado
          if (statusRequirements === "Aprovado") {
            const user = await User.findOne({ nickname: requirement.promoted });
            if (user) {
              user.active = false;
              user.patent = "Civil";
              user.status = "Desativado";
              user.medals = 0;
              user.warnings = 0;
              user.emblemas = [];
              user.emblemasExibidos = [];
              user.bannersExibidos = [];
              await user.save();
            }
          }
          await requirementsController.addLog(requirement, nicknameOperator, statusRequirements === 'Aprovado' ? 'aceitou' : 'reprovou');
          return res.status(200).json({ message: "Status atualizado com sucesso!" });
        }
        // Se for Transferência, delega para updateTransfer
        if (requirement.typeRequirement === "Transferência") {
          // Chama o método updateTransfer do ServiceControllerRequirements
          await requirementsController.updateTransfer({
            body: {
              idRequirements,
              transferido: requirement.transferido,
              patent: requirement.patent,
              reason: requirement.reason,
              statusRequirements
            },
            idUser: req.idUser,
            headers: req.headers,
            connection: req.connection,
          }, res);
          return;
        }
        // Demais tipos mantém lógica antiga
        const nickname = await User.findOne({ nickname: requirement.promoted });
        if (!nickname) {
          return res.status(404).json({ msg: 'Ops! Usuário promovido não encontrado.' });
        }
        nickname.nickname = nickname.nickname;
        if (requirement.typeRequirement === "Rebaixamento" && statusRequirements === "Aprovado") {
          nickname.patent = requirement.newPatent;
        } else if (statusRequirements === "Aprovado") {
          nickname.patent = requirement.newPatent;
        }
        nickname.code =  requirement.newMotto ?? nickname.code;
        nickname.classes = nickname.classes;
        nickname.teans = nickname.teans;
        nickname.status = nickname.status;
        nickname.tag = nickname.tag;
        nickname.warnings = requirement.typeRequirement === "Advertência" ? 1 : nickname.warnings;
        nickname.medals = nickname.medals;
        nickname.password = nickname.password;
        nickname.userType = nickname.userType;
        requirement.status = statusRequirements;
        await nickname.save();
        await requirement.save();
        // Adiciona log de ação
        await requirementsController.addLog(requirement, nicknameOperator, statusRequirements === 'Aprovado' ? 'aceitou' : 'negou');
        return res.status(200).json({ msg: `Requerimento ${statusRequirements} com sucesso.` });
      }
      return res.status(404).json({ msg: 'Ops! Parece que você não tem permissão para editar esse documento.' });
    } catch (error) {
      console.error('Não foi possível atualizar o requerimento.', error);
      res.status(500).json({ msg: 'Não foi possível atualizar o requerimento' })
    }
  };

  async deleteRequeriments(req, res){
    try {
      const { idRequirements } = req.body;
      const idUser = req.idUser;
      const admin = await User.findOne({ _id: idUser });
      const deleteRequeriment = await Requirements.findOne({ _id: idRequirements })

      if (!deleteRequeriment) {
        return res.status(404).json({ error: 'Requerimento não encontrado não encontrado' });
      }

      if (admin && (admin.userType === "Admin" || admin.userType === "Diretor" || admin.userType === "Recursos Humanos") ) {
        await Requirements.findByIdAndDelete(idRequirements);
        return res.status(200).json({ msg: 'Requerimento deletedo com sucesso' });
      }

      return res.status(404).json({ error: 'Ops! Você não tem permissão para excluir esse requerimento.' })

    } catch (error) {
      console.error('Não foi possível deletar o requerimento', error);
      res.status(500).json({ error: 'Não foi possível deletar o requerimento' })
    }

  };
};

