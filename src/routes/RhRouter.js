
import express from "express"
import ServiceControllerRh from "../controllers/RhController.js";
import { authGuard } from "../Middleware/authGuard.js";

const RhRouter = express.Router();
const serviceControllerRh = new ServiceControllerRh();

//Recursos Humanos 
RhRouter.route('/update/status').put(authGuard(['Admin', 'Diretor', 'Recursos Humanos']),(req, res) => serviceControllerRh.editRequeriment(req, res));
RhRouter.route('/delete/status').delete(authGuard(['Admin', 'Diretor', 'Recursos Humanos']),(req, res) => serviceControllerRh.deleteRequeriments(req, res))

export default RhRouter;