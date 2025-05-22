import { ForumReply } from '../Models/ForumReplyModel.js';
import { ForumTopic } from '../Models/ForumTopicModel.js';
import { ForumGroup } from '../Models/ForumGroupModel.js';

export default class ForumReplyController {
  async create(req, res) {
    try {
      const { topicId, body, image } = req.body;
      const author = req.user.nickname;
      if (!topicId || !body) return res.status(400).json({ error: 'Campos obrigatórios.' });
      const topic = await ForumTopic.findById(topicId);
      if (!topic) return res.status(404).json({ error: 'Tópico não encontrado.' });
      const group = await ForumGroup.findById(topic.forumGroupId);
      const userCargo = req.user.cargoInterno || req.user.hierarquia || req.user.patente;
      if (group.permissoes && group.permissoes[userCargo] && !group.permissoes[userCargo].Responder) {
        return res.status(403).json({ error: 'Você não tem permissão para responder neste grupo.' });
      }
      const reply = await ForumReply.create({ topicId, body, image, author });
      res.status(201).json(reply);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao criar resposta.' });
    }
  }

  async list(req, res) {
    try {
      const { topicId } = req.query;
      const replies = await ForumReply.find(topicId ? { topicId } : {}).sort({ createdAt: 1 });
      res.json(replies);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar respostas.' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { body, image } = req.body;
      const reply = await ForumReply.findByIdAndUpdate(id, { body, image }, { new: true });
      res.json(reply);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao editar resposta.' });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      await ForumReply.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao deletar resposta.' });
    }
  }

  async countReplies(req, res) {
    try {
      const { topicId } = req.query;
      if (!topicId) return res.status(400).json({ error: 'topicId obrigatório.' });
      const count = await ForumReply.countDocuments({ topicId });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao contar respostas.' });
    }
  }
} 