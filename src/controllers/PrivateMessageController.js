import { PrivateMessage } from '../Models/PrivateMessageModel.js';
import { User } from '../Models/useModel.js';

export default class PrivateMessageController {
  // Enviar mensagem privada
  async sendMessage(req, res) {
    try {
      const { destinatario, assunto, corpo } = req.body;
      const remetente = req.user?.nickname || req.body.remetente;
      if (!remetente || !destinatario || !assunto || !corpo) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
      }
      // Verifica se destinatário existe
      const userDest = await User.findOne({ nickname: destinatario });
      if (!userDest) {
        return res.status(404).json({ error: 'Destinatário não encontrado.' });
      }
      const msg = await PrivateMessage.create({ remetente, destinatario, assunto, corpo });
      return res.status(201).json({ msg: 'Mensagem enviada com sucesso.', message: msg });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao enviar mensagem.' });
    }
  }

  // Listar inbox (mensagens recebidas)
  async inbox(req, res) {
    try {
      const nickname = req.user?.nickname;
      const msgs = await PrivateMessage.find({ destinatario: nickname, apagadaDestinatario: false }).sort({ createdAt: -1 });
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    }
  }

  // Listar enviadas
  async sent(req, res) {
    try {
      const nickname = req.user?.nickname;
      const msgs = await PrivateMessage.find({ remetente: nickname, apagadaRemetente: false }).sort({ createdAt: -1 });
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar mensagens enviadas.' });
    }
  }

  // Marcar como lida
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const nickname = req.user?.nickname;
      const msg = await PrivateMessage.findOne({ _id: id, destinatario: nickname });
      if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada.' });
      msg.lida = true;
      await msg.save();
      res.json({ msg: 'Mensagem marcada como lida.' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao marcar como lida.' });
    }
  }

  // Apagar mensagem (soft delete)
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const nickname = req.user?.nickname;
      const msg = await PrivateMessage.findById(id);
      if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada.' });
      let alterado = false;
      if (msg.remetente === nickname) {
        msg.apagadaRemetente = true;
        alterado = true;
      }
      if (msg.destinatario === nickname) {
        msg.apagadaDestinatario = true;
        alterado = true;
      }
      if (!alterado) return res.status(403).json({ error: 'Sem permissão.' });
      await msg.save();
      // Se ambos apagaram, remove do banco
      if (msg.apagadaRemetente && msg.apagadaDestinatario) {
        await PrivateMessage.findByIdAndDelete(id);
      }
      res.json({ msg: 'Mensagem apagada.' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao apagar mensagem.' });
    }
  }
} 