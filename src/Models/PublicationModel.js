import mongoose from 'mongoose';

const PublicationSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    linkImg: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Publication = mongoose.model('Publication', PublicationSchema);

export { Publication, PublicationSchema };
