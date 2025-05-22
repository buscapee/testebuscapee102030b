import mongoose from 'mongoose';

const LoggerSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    loggerType: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Logger = mongoose.model('Logger', LoggerSchema);

export { Logger, LoggerSchema };
