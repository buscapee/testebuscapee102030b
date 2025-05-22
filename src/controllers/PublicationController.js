import { User } from '../Models/useModel.js';
import { Teams } from '../Models/teamsModel.js';
import { Publication } from '../Models/PublicationModel.js';
import { Utils } from '../utils/UserUtils.js';


export default class ServiceControllerPublication {
    utils;

    constructor(){
        this.utils = new Utils();
    }

    async createPublication(req, res) {
        try {
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const { title, content, linkImg } = req.body;
            const idUser = req.idUser;
            const nickname = await User.findOne({ _id: idUser });
            const team = await Teams.findOne({ nameTeams: "Marketing" });
 
            if (!idUser || !title || !content || !linkImg) {
                return res.status(422).json({ error: 'Preencha todos os campos' })
            }

            if (!nickname) {
                return res.status(404).json({ error: "Usuário não encontrado" })
            }

            if (nickname && (nickname.userType === "Admin" || nickname.userType === "Diretor" || nickname.nickname === team.leader)) {

                const newPublication = {
                    user: nickname.nickname,
                    title,
                    content,
                    linkImg,
                }

                const createPublications = await Publication.create(newPublication);
                if (!createPublications) {
                    return res.status(422).json({ error: 'Ops! Parece que houve um erro, tente novamente mais tarde.' })
                }

                await this.utils.createLogger("Acabou de criar uma publicação", nickname.nickname, title, ipAddress)
                return res.status(201).json({ msg: 'Publicação criada com sucesso.' })
            }

            return res.status(403).json({ error: 'Ops! Parece que você não tem permissão para efetuar essa operação.' })

        } catch (error) {
            console.error('Erro ao criar publicação', error);
            res.status(500).json({ error: 'Erro ao criar publicação.' })
        }
    };

    async deletePublications(req, res) {
        try {
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const { idPublication } = req.body;
            const idUser = req.idUser;
            const admin = await User.findOne({ _id: idUser });
            const deletePublication = await Publication.findOne({ _id: idPublication })
            const team = await Teams.findOne({ nameTeams: "Marketing" });
            if (!deletePublication) {
                return res.status(404).json({ error: 'Publicação não encontrado' });
            }

            if (admin && (admin.userType === "Admin" || admin.userType === "Diretor" || admin.nickname === team.leader)) {
                await Publication.findByIdAndDelete(idPublication);
                await this.utils.createLogger("Deletou a publicação", admin.nickname, deletePublication.title, ipAddress);
                return res.status(200).json({ msg: 'Publicação deleteda com sucesso' });
            }

            await this.utils.createLogger("Tentou deletar publicação sem permissão", admin.nickname, deletePublication.title, ipAddress)
            return res.status(404).json({ error: 'Ops! Você não tem permissão para excluir essa publicação.' })

        } catch (error) {
            console.error('Não foi possível deletar a publicação', error);
            res.status(500).json({ error: 'Não foi possível deletar a publicação' })
        }
    };

    async getAllPublications(req, res) {
        try {
            const publications = await Publication.find();
            res.json(publications)
        } catch (error) {

            console.error('Publicações não encontradas', error);
            res.status(500).json({ error: 'Publicações não encontradas' })
        }
    };

};
