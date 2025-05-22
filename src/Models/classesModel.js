import mongoose from 'mongoose';

const ClasseSchema = new mongoose.Schema({
    nameClasse: {
        type: String,
        require: true
    },
    team: {
        type: String,
        require: true
    },
    patent: {
        type: String,
        require: true
    }
}, { timestamps: true });

const Classes = mongoose.model('Classes', ClasseSchema);

export { Classes, ClasseSchema };
