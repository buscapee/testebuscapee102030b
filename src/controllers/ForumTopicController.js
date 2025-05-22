import { ForumTopic } from '../Models/ForumTopicModel.js';
import { ForumGroup } from '../Models/ForumGroupModel.js';

export default class ForumTopicController {
  async create(req, res) {
    try {
      const { forumGroupId, title, body, image } = req.body;
      const author = req.user.nickname;
      if (!forumGroupId || !title || !body) return res.status(400).json({ error: 'Campos obrigatórios.' });
      // Buscar grupo e checar permissão
      const group = await ForumGroup.findById(forumGroupId);
      if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });
      const userCargo = req.user.cargoInterno || req.user.hierarquia || req.user.patente;
      if (group.permissoes && group.permissoes[userCargo] && !group.permissoes[userCargo].Criar) {
        return res.status(403).json({ error: 'Você não tem permissão para criar tópicos neste grupo.' });
      }
      const topic = await ForumTopic.create({ forumGroupId, title, body, image, author });
      res.status(201).json(topic);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao criar tópico.' });
    }
  }

  async list(req, res) {
    try {
      const { forumGroupId } = req.query;
      const topics = await ForumTopic.find(forumGroupId ? { forumGroupId } : {}).sort({ createdAt: -1 });
      res.json(topics);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar tópicos.' });
    }
  }

  async reply(req, res) {
    try {
      const { id } = req.params;
      const { body, image } = req.body;
      const author = req.user.nickname;
      if (!body) return res.status(400).json({ error: 'Mensagem obrigatória.' });
      const topic = await ForumTopic.findById(id);
      if (!topic) return res.status(404).json({ error: 'Tópico não encontrado.' });
      const group = await ForumGroup.findById(topic.forumGroupId);
      const userCargo = req.user.cargoInterno || req.user.hierarquia || req.user.patente;
      if (group.permissoes && group.permissoes[userCargo] && !group.permissoes[userCargo].Responder) {
        return res.status(403).json({ error: 'Você não tem permissão para responder neste grupo.' });
      }
      const updatedTopic = await ForumTopic.findByIdAndUpdate(
        id,
        { $push: { respostas: { author, body, image } } },
        { new: true }
      );
      res.json(updatedTopic);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao responder tópico.' });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      await ForumTopic.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao deletar tópico.' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { body, image } = req.body;
      const topic = await ForumTopic.findByIdAndUpdate(id, { body, image }, { new: true });
      res.json(topic);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao editar resposta.' });
    }
  }

  // Editar resposta individual
  async editarResposta(req, res) {
    try {
      const { id, respostaId } = req.params;
      const { body } = req.body;
      const topic = await ForumTopic.findOneAndUpdate(
        { _id: id, "respostas._id": respostaId },
        { $set: { "respostas.$.body": body } },
        { new: true }
      );
      res.json(topic);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao editar resposta.' });
    }
  }

  // Apagar resposta individual
  async apagarResposta(req, res) {
    try {
      const { id, respostaId } = req.params;
      const topic = await ForumTopic.findByIdAndUpdate(
        id,
        { $pull: { respostas: { _id: respostaId } } },
        { new: true }
      );
      res.json(topic);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao apagar resposta.' });
    }
  }
} 