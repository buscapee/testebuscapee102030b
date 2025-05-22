import express from "express"
import ServiceControllerEndorsement from "../controllers/endorsementController.js";
import { authGuard } from "../Middleware/authGuard.js";

const EndorsementRouter = express.Router();
const serviceControllerEndorsement = new ServiceControllerEndorsement();

EndorsementRouter.route('/endorsement').post(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerEndorsement.createAval(req, res));
EndorsementRouter.route('/endorsement/status').put(authGuard(['Admin', 'Diretor','Recursos Humanos']),(req, res) => serviceControllerEndorsement.editAval(req, res));
EndorsementRouter.route('/endorsement/delete').delete(authGuard(['Admin', 'Diretor']),(req, res) => serviceControllerEndorsement.deleteAval(req, res));
EndorsementRouter.route('/endorsement/').get(authGuard(['Admin', 'Diretor', 'Recursos Humanos']),(req, res) => serviceControllerEndorsement.getAval(req, res));


export default EndorsementRouter;