import mongoose from 'mongoose';

const teamsSchema = new mongoose.Schema({
    nameTeams: {
        type: String,
        required: true
    },
    leader: {
        type: String,
        required: false
    },
    viceLeader: {
        type: String,
        required: false
    },
    members: {
        type: Array,
        required: false
    },
    url: {
        type: String,
        required: true
    },
    emblema: {
        type: String,
        required: false
    },
    hierarquia: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const Teams = mongoose.model('Teams', teamsSchema);

export { Teams, teamsSchema };
