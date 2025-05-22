import mongoose from 'mongoose';

const ImagesSchema = new mongoose.Schema({
    imageOne: {
        type: String,
        require: true
    },
    imageTwo: {
        type: String,
        require: true
    },
    imageThree: {
        type: String,
        require: true
    },

    imageFour: {
        type: String,
        require: true
    }
}, { timestamps: true });

const Images = mongoose.model('Images', ImagesSchema);

export { Images, ImagesSchema };
