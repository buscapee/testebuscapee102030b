import mongoose from 'mongoose';

const PrivateMessageSchema = new mongoose.Schema({
  remetente: { type: String, required: true }, // nickname do remetente
  destinatario: { type: String, required: true }, // nickname do destinatário
  assunto: { type: String, required: true },
  corpo: { type: String, required: true },
  lida: { type: Boolean, default: false },
  apagadaRemetente: { type: Boolean, default: false },
  apagadaDestinatario: { type: Boolean, default: false },
}, { timestamps: true });

const PrivateMessage = mongoose.model('PrivateMessage', PrivateMessageSchema);

export { PrivateMessage, PrivateMessageSchema }; 