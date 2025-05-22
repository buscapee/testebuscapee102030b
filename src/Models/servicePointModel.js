import mongoose from 'mongoose';

const servicePointSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  setor: { type: String, required: true, default: 'Batalhão' },
  inicio: { type: Date, required: true },
  fim: { type: Date },
  aberto: { type: Boolean, default: true },
  setores: [{
    nome: { type: String, required: true },
    inicio: { type: Date, required: true },
    fim: { type: Date }
  }]
}, { timestamps: true });

const ServicePoint = mongoose.model('ServicePoint', servicePointSchema);

export { ServicePoint }; 