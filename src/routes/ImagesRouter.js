
import express from "express"
import { authGuard } from "../Middleware/authGuard.js";
import ServiceControllerImages from "../controllers/ImagesController.js";

const ImagesRouter = express.Router();
const serviceControllerImages = new ServiceControllerImages();

ImagesRouter.route('/images').post(authGuard(['Admin']),(req, res) => serviceControllerImages.created(req, res))
ImagesRouter.route('/images').put(authGuard(['Admin']),(req, res) => serviceControllerImages.update(req, res))
ImagesRouter.route('/images').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerImages.get(req, res))

export default ImagesRouter;