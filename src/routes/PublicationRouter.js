import express from "express"
import ServiceControllerPublication from "../controllers/PublicationController.js";
import { authGuard } from "../Middleware/authGuard.js";

const PublicationRouter = express.Router();
const serviceControllerPublication = new ServiceControllerPublication();

PublicationRouter.route('/create/publication').post(authGuard(['Admin']),(req, res) => serviceControllerPublication.createPublication(req, res));
PublicationRouter.route('/delete/publication').delete(authGuard(['Admin']),(req, res) => serviceControllerPublication.deletePublications(req, res));
PublicationRouter.route('/publication').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerPublication.getAllPublications(req, res));

export default PublicationRouter;