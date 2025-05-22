import mongoose from 'mongoose';

const ForumGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team: { type: String, required: true }, // Ex: "Centro de Instrução"
  createdBy: { type: String, required: true }, // nickname do criador
  permissoes: { type: Object, default: {} }, // Permissões por cargo interno
  status: { type: String, default: 'Ativado' },
}, { timestamps: true });

const ForumGroup = mongoose.model('ForumGroup', ForumGroupSchema);
export { ForumGroup, ForumGroupSchema }; 