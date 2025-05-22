import { ForumGroup } from '../Models/ForumGroupModel.js';

export default class ForumGroupController {
  async create(req, res) {
    try {
      const { name, team, permissoes, status } = req.body;
      const createdBy = req.user.nickname;
      if (!name || !team) return res.status(400).json({ error: 'Nome e equipe são obrigatórios.' });
      const group = await ForumGroup.create({ name, team, createdBy, permissoes, status });
      res.status(201).json(group);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao criar grupo.' });
    }
  }

  async list(req, res) {
    try {
      const { team } = req.query;
      const groups = await ForumGroup.find(team ? { team } : {});
      res.json(groups);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar grupos.' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, permissoes, status } = req.body;
      const updateFields = {};
      if (name) updateFields.name = name;
      if (permissoes) updateFields.permissoes = permissoes;
      if (status) updateFields.status = status;
      const group = await ForumGroup.findByIdAndUpdate(id, updateFields, { new: true });
      res.json(group);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao editar grupo.' });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      await ForumGroup.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao apagar grupo.' });
    }
  }
} 