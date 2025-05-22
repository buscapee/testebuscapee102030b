import express from "express"
import ServiceControllerLogger from "../controllers/logsController.js";
import { authGuard } from "../Middleware/authGuard.js";

const LoggerRouter = express.Router();
const serviceControllerLogger = new ServiceControllerLogger();

LoggerRouter.route('/loggers').get(authGuard(['Admin', 'Diretor']),(req, res) => serviceControllerLogger.getAllLogs(req, res))
LoggerRouter.route('/loggers/duplicated-ips').get(authGuard(['Admin', 'Diretor']),(req, res) => serviceControllerLogger.getDuplicatedIPs(req, res))
LoggerRouter.route('/ips').get(authGuard(['Admin', 'Diretor']),(req, res) => serviceControllerLogger.getAllIps(req, res))
//LoggerRouter.route('/loggers').delete((req, res) => serviceControllerLogger.deleteLogs(req, res))import express from "express"

export default LoggerRouter;