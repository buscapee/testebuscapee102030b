import mongoose from 'mongoose';

const DocsSystemSchema = new mongoose.Schema({
    nameDocs: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    create: {
        type: String,
        required: true
    },
    docsType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Ativo", "Desativado"],
        required: true,
    },
    script: {
        type: Boolean,
        required: true,
    },

    url: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: false,
    }
}, { timestamps: true });

const DocsSystem = mongoose.model('Docs', DocsSystemSchema);

export { DocsSystem, DocsSystemSchema };
