import express from "express"
import ServiceControllerSystem from "../controllers/systemController.js";
import { authGuard } from "../Middleware/authGuard.js";

const SystemRouter = express.Router();
const serviceControllerSystem = new ServiceControllerSystem();

SystemRouter.route('/all/info').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerSystem.getInfoSystem(req, res))
SystemRouter.route('/create/info').post(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerSystem.createInfo(req, res));
SystemRouter.route('/patents').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerSystem.searchUserPatent(req, res))
SystemRouter.route('/infos').put(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerSystem.updateInfos(req, res))
SystemRouter.route('/infos').get((req, res) => serviceControllerSystem.getInfoSystemDpanel(req, res))
SystemRouter.route('/export').get((req, res) => serviceControllerSystem.exportAllCollections(req, res))
SystemRouter.route('/import').post((req, res) => serviceControllerSystem.importDatabase(req, res))
SystemRouter.route('/honrarias').get(authGuard(['Admin', 'Diretor']), (req, res) => serviceControllerSystem.getHonrarias(req, res));
SystemRouter.route('/honrarias').post(authGuard(['Admin', 'Diretor']), (req, res) => serviceControllerSystem.addHonraria(req, res));
SystemRouter.route('/honrarias/edit').put(authGuard(['Admin', 'Diretor']), (req, res) => serviceControllerSystem.editHonraria(req, res));
SystemRouter.route('/honrarias/delete').delete(authGuard(['Admin', 'Diretor']), (req, res) => serviceControllerSystem.deleteHonraria(req, res));

export default SystemRouter;