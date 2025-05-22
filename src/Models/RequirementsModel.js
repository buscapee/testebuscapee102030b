import mongoose from 'mongoose';

const requirementsSchema = new mongoose.Schema({
    promoted: {
        type: String,
        required: true
    },
    newPatent: {
        type: String,
        required: false
    },
    newMotto: {
        type: String,
        required: false
    },
    patentOperador: {
        type: String,
        required: false
    },
    operator: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    classe: {
        type: String,
        required: false
    },
    team: {
        type: String,
        required: false
    },
    typeRequirement: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pendente", "Aprovado", "Reprovado"],
        required: true
    },
    oldPatent: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: false
    },
    crhAnalysis: {
        type: String,
        required: false
    },
    permissor: {
        type: String,
        required: false
    },
    anexoProvas: {
        type: String,
        required: false
    },
    banidoAte: {
        type: Date,
        required: false
    },
    nickNovo: {
        type: String,
        required: false
    },
    tagNova: {
        type: String,
        required: false
    },
    tipoTransferencia: {
        type: String,
        required: false
    },
    authorized: {
        type: String,
        required: false
    },
    logs: [
        {
            user: { type: String },
            action: { type: String },
            date: { type: Date },
            type: { type: String }
        }
    ],
}, { timestamps: true });

const Requirements = mongoose.model('Requirements', requirementsSchema);

export { Requirements, requirementsSchema };
