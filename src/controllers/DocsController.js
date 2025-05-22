import { Teams } from "../Models/teamsModel.js";
import { User } from "../Models/useModel.js";
import { DocsSystem } from "../Models/docsModel.js";
import { Classes } from "../Models/classesModel.js";
import { Utils } from "../utils/UserUtils.js";
import mongoose from "mongoose";

const utils = new Utils();
const createClasse = async (classe, team) => {
    try {
        const newClasse = {
            nameClasse: classe,
            team: team,
            patent: "Todas"
        };

        const classeCriada = await Classes.create(newClasse);
        return classeCriada ? "Aula criada com sucesso." : "Não foi possível criar a aula.";

    } catch (error) {
        console.error("Erro ao criar aula.", error);
    }
}


export default class ServiceControllerDocs {
    //Função responsável por criar a equioe
    async createDocs(req, res) {
        try {
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const { nameDocs, content, docsType, script, imageUrl } = req.body;
            const idUser = req.idUser;
            const nickname = await User.findOne({ _id: idUser });
            const teams = await Teams.findOne({ nameTeams: docsType });

            if (!nameDocs || !content || content === "<p><br></p>" || !docsType) {
                return res.status(422).json({ error: 'Ops! Parece que você não preencheu todos os dados' });
            }

            if (script === true) {
                await createClasse(nameDocs, docsType)
            }

            if (nickname && (nickname.userType === "Admin" || nickname.nickname === teams.leader || nickname.nickname === teams.viceLeader || nickname.userType === "Diretor")) {
                const newDoc = {
                    nameDocs: nameDocs,
                    content: content,
                    create: nickname.nickname,
                    docsType: docsType,
                    status: "Ativo",
                    script,
                    url: utils.createURL(nameDocs),
                    imageUrl: imageUrl || undefined
                };
                await utils.createLogger("Criou um novo documento", nickname.nickname, nameDocs, ipAddress);
                const docCriado = await DocsSystem.create(newDoc);

                if (!docCriado) {
                    return res.status(422).json({ error: 'Ops! Parece que houve um erro, tente novamente mais tarde.' });
                }

                return res.status(201).json({ msg: 'Documento criado com sucesso.' });
            }

            return res.status(422).json({ error: 'Ops! Parece que você não tem permissão para postar essa aula.' });

        } catch (error) {
            console.error('Erro ao registrar', error);
            return res.status(500).json({ msg: 'Erro ao criar documento.' });
        }
    };

    async getAllDocs(req, res) {
        try {
            // Definindo o número da página padrão como 1 e o tamanho padrão da página como 10, 
            // mas você pode ajustá-los conforme necessário.
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Calcular o índice do primeiro documento a ser recuperado com base no número da página e no tamanho da página.
            const startIndex = (page - 1) * limit;

            // Consulta os documentos usando o método find() com skip() e limit() para a paginação.
            const docs = await DocsSystem.find().skip(startIndex).limit(limit);

            res.json(docs);
        } catch (error) {
            console.error('Documento não encontrado', error);
            res.status(500).json({ msg: 'Documento não encontrado' })
        }
    };

    //Função Responsável por mostrar todas as equipes ou filtrar as equipes de acordo com a query
    async searchTeams(req, res) {
        try {
            const nameTeams = req.query.nameTeams;

            const teams = await Teams.find().sort({ nameTeams: 1 });
            const resTeams = nameTeams
                ? teams.filter(team => team.nameTeams.includes(nameTeams))
                : teams;
            return res.json(resTeams);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    };

    //Função para atualizar a equipe
    async updateDocs(req, res) {
        try {
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const { nameDocs, content, docsType, idDoc, script, imageUrl } = req.body;
            const idUser = req.idUser;
            // Validação do ID do documento
            if (!mongoose.Types.ObjectId.isValid(idDoc)) {
                return res.status(400).json({ error: 'ID do documento inválido.' });
            }

            const userAdmin = await User.findById(idUser);
            const docUpdate = await DocsSystem.findById(idDoc);
            const teams = await Teams.findOne({ nameTeams: docsType });

            // Validação da existência do documento
            if (!docUpdate) {
                return res.status(404).json({ error: 'Ops! Documento não encontrado.' });
            }

            if (userAdmin && (userAdmin.userType === "Admin" || (teams && userAdmin.nickname === teams.leader || userAdmin.nickname === teams.viceLeader) || userAdmin.userType === "Diretor")) {

                if (script === true) {
                    await createClasse(nameDocs, docsType);
                }

                docUpdate.nameDocs = nameDocs || docUpdate.nameDocs;
                docUpdate.content = content || docUpdate.content;
                docUpdate.docsType = docsType || docUpdate.docsType;
                docUpdate.script = script !== undefined ? script : docUpdate.script;
                docUpdate.url = docUpdate.nameDocs !== nameDocs ? utils.createURL(nameDocs) : docUpdate.nameDocs;
                if (imageUrl !== undefined) docUpdate.imageUrl = imageUrl;

                await docUpdate.save();
                await utils.createLogger("Editou o documento", userAdmin.nickname, docUpdate.nameDocs, ipAddress);
                return res.status(200).json({ msg: 'Documento atualizado com sucesso!' });
            }

            return res.status(403).json({ error: 'Ops! Parece que você não é um administrador.' });
        } catch (error) {
            console.error('Ops! Não foi possível atualizar o documento.', error);
            res.status(500).json({ error: 'Ops! Não foi possível atualizar o documento.' });
        }
    };

    //Função responsável por deletar uma equipe de acordo com o id params dela.
    async deleteDocs(req, res) {
        try {
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const { idDoc, idTeam } = req.body;
            const idUser = req.idUser;
            const admin = await User.findById(idUser)
            const TeamSelect = await Teams.findById(idTeam)
            const deleteDoc = await DocsSystem.findById(idDoc)

            if (!deleteDoc) {
                return res.status(404).json({ msg: 'Ops! Documento não encontrado' });
            }

            if (admin && (admin.userType === "Admin" || admin.userType === "Diretor")) {
                await DocsSystem.findByIdAndDelete(deleteDoc._id);
                await utils.createLogger("Deletou o documento", admin.nickname, deleteDoc.nameDocs, ipAddress);

                return res.status(200).json({ msg: 'Documento deletedo com sucesso' });

            } else if (TeamSelect.leader === admin.nickname) {
                await DocsSystem.findByIdAndDelete(deleteDoc._id);
                await utils.createLogger("Deletou o documento", admin.nickname, deleteDoc.nameDocs, ipAddress);
                return res.status(200).json({ msg: 'Documento deletedo com sucesso' });

            } else {
                return res.status(404).json({ msg: 'Ops! Parece que você não é um administrador.' });
            }

        } catch (error) {
            console.error('Não foi possível deletar o documento.', error);
            res.status(500).json({ msg: 'Não foi possível deletar o documento.' })
        }
    };

    async searchDoc(req, res) {
        try {
            const document = req.query.typeDocument;

            if (!document) {
                return res.status(400).json({ error: 'O tipo de documento não foi fornecido.' });
            }

            const docsType = await DocsSystem.find({ docsType: document }).select("-content");

            // Verifica se há documentos encontrados
            if (docsType.length === 0) {
                return res.json([]); // Retorna um array vazio se não houver documentos encontrados
            }

            const resUser = docsType.filter(doc => doc.docsType.includes(document));

            return res.json(resUser);

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    };

    async searchDoc(req, res) {
        try {
            const document = req.query.typeDocument;

            if (!document) {
                return res.status(500).json({ error: 'Informações do sistema não encontradas.' });
            }

            const docsType = await DocsSystem.find({ docsType: document }).select("-content");

            const resUser = docsType.filter(doc => doc.docsType.includes(document));

            return res.json(resUser);

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    };

    async searchDocCompleted(req, res) {
        try {
            const document = req.query.urlDocument;

            if (!document) {
                return res.status(500).json({ error: 'Informações do sistema não encontradas.' });
            }
            const docsType = await DocsSystem.findOne({ url: document });
            return res.json(docsType);

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    };
   
}
