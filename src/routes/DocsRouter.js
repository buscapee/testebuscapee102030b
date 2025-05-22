import express from "express"
import ServiceControllerDocs from "../controllers/DocsController.js";
import { authGuard } from "../Middleware/authGuard.js";

const DocsRouter = express.Router();
const serviceControllerDocs = new ServiceControllerDocs();

DocsRouter.route('/create/docs').post(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerDocs.createDocs(req, res));
DocsRouter.route('/all/docs').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerDocs.getAllDocs(req, res))
DocsRouter.route('/update/docs').put(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerDocs.updateDocs(req, res))
DocsRouter.route('/delete/docs').delete(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerDocs.deleteDocs(req, res))
DocsRouter.route('/doc/search').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerDocs.searchDoc(req, res));
DocsRouter.route('/doc').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerDocs.searchDocCompleted(req, res));

export default DocsRouter;