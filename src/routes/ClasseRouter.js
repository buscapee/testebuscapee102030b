import express from "express"
import ServiceControllerClasse from "../controllers/ClassesController.js";
import { authGuard } from "../Middleware/authGuard.js";

const ClasseRouter = express.Router();
const serviceControllerClasse = new ServiceControllerClasse();

//classes 
ClasseRouter.route('/create/classe').post(authGuard(['Admin']),(req, res) => serviceControllerClasse.createClasse(req, res));
ClasseRouter.route('/delete/classe').delete(authGuard(['Admin']),(req, res) => serviceControllerClasse.deleteClasse(req, res));
ClasseRouter.route('/create/classe/requirement').post(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerClasse.postClasse(req, res));
ClasseRouter.route('/create/ci/requirement').post(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerClasse.postCI(req, res));
ClasseRouter.route('/update/classe').put(authGuard(['Admin']),(req, res) => serviceControllerClasse.updateClasse(req, res));
ClasseRouter.route('/get/classe').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerClasse.getClasses(req, res));


export default ClasseRouter;