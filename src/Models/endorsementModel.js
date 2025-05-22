import mongoose from 'mongoose';

const EndorsementSchema = new mongoose.Schema({
    nicknameAval: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endorsementdays: {
        type: Number,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pendente", "Aprovado", "Reprovado"],
        required: true
    },
}, { timestamps: true });

const Endorsement = mongoose.model('Endorsement', EndorsementSchema);

export { Endorsement, EndorsementSchema };
