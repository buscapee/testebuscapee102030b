import { User } from '../Models/useModel.js';
import { Endorsement } from '../Models/endorsementModel.js';
import { Utils } from '../utils/UserUtils.js';
import moment from 'moment'

const utils = new Utils();

export default class ServiceControllerEndorsement {
  //Função para aprovar ou reprovar requerimentos:
  async createAval(req, res) {
    try {
      const { nicknameAval, initialDate, reason, endorsementdays } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const nickname = await User.findOne({ nickname: nicknameAval });
      if (!nickname || !nicknameOperator) {
        return res.status(404).json({ error: 'Usuário não encontrado com o nickname fornecido.' });
      }

      const startDate = moment(initialDate, 'YYYY-MM-DD');
      const endDate = startDate.clone().add(endorsementdays, 'days');

      const formattedStartDate = startDate.format('DD/MM/YYYY');
      const formattedEndDate = endDate.format('DD/MM/YYYY');

      const newEndorsement = {
        nicknameAval: nickname.nickname,
        reason: reason,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        endorsementdays,
        status: "Pendente"
      };

      const sucesso = await Endorsement.create(newEndorsement);
      if (sucesso) {
        return res.status(200).json({ msg: "Aval criado com sucesso." });
      }
      return res.status(500).json({ error: "Erro desconhecido." });
    } catch (error) {
      console.error('Não foi possível criar a avaliação.', error);
      return res.status(500).json({ msg: 'Não foi possível criar a avaliação.' });
    }
  };

  async editAval(req, res) {
    try {
      const { idAval, statusAval } = req.body;
      const idUser = req.idUser;
      const nicknameOperator = await User.findOne({ _id: idUser });
      const aval = await Endorsement.findOne({ _id: idAval })

      if (!nicknameOperator) {
        res.status(404).json({ msg: 'Ops! Usuário não encontrado.' });
      }

      if (!aval) {
        res.status(404).json({ msg: 'Ops! Aval não encontrado.' });
      }

      if (nicknameOperator && (nicknameOperator.userType === "Admin" || nicknameOperator.userType === "Recursos Humanos" || nicknameOperator.userType === "Diretor")) {
        aval.nicknameAval = aval.nicknameAval;
        aval.startDate = aval.startDate;
        aval.endorsementdays = aval.endorsementdays;
        aval.endDate = aval.endDate;
        aval.reason = aval.reason;
        aval.status = statusAval === "Aprovado" ? statusAval : "Reprovado";
        await aval.save();
        return res.status(200).json({ msg: `Aval ${statusAval} com sucesso.` });
      }

      return res.status(404).json({ msg: 'Ops! Parece que você não tem permissão para editar esse documento.' });

    } catch (error) {
      console.error('Não foi possível atualizar o aval.', error);
      res.status(500).json({ error: 'Não foi possível atualizar o aval.' })
    }

  };

  async deleteAval(req, res) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const { idAval } = req.body;
      const idUser = req.idUser;
      const admin = await User.findOne({ _id: idUser });
      const aval = await Endorsement.findOne({ _id: idAval })
      if (!aval) {
        return res.status(404).json({ error: 'Aval não encontrado' });
      }

      if (admin && (admin.userType === "Admin" || admin.userType === "Diretor")) {
        await Endorsement.findByIdAndDelete(idAval);
        return res.status(200).json({ msg: 'Aval deletado com sucesso' });
      }

      await utils.createLogger("Acabou de deletar um", admin.nickname, "Aval", ipAddress)
      return res.status(404).json({ error: 'Ops! Você não tem permissão para excluir esse Aval.' })

    } catch (error) {
      console.error('Não foi possível deletar o aval', error);
      res.status(500).json({ error: 'Não foi possível deletar a publicação' })
    }

  };

  async getAval(req, res) {
    try {
      // Busca todos os registros de Endorsement do banco de dados, ordenando por data de forma decrescente
      const avais = await Endorsement.find().sort({ createdAt: -1 });

      // Retorna os dados ordenados por data decrescente
      return res.json(avais);

    } catch (error) {
      // Trata erros de forma apropriada
      console.error('Erro ao obter avaliações', error);
      res.status(500).json({ error: 'Erro ao obter avaliações' });
    }
  };

};

