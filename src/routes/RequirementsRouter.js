import express from "express";
import ServiceControllerRequirements from "../controllers/Requirements.js";
import { authGuard } from "../Middleware/authGuard.js";

const RequirementsRouter = express.Router();
const serviceControllerRequirements = new ServiceControllerRequirements();

RequirementsRouter.route("/post/requirement/promoted").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.createRequirements(req, res),
);
RequirementsRouter.route("/search/requeriments").get(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.searchRequeriments(req, res),
);
RequirementsRouter.route("/post/requirement/relegation").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) =>
    serviceControllerRequirements.createRequirementsRelegation(req, res),
);
RequirementsRouter.route("/post/requirement/warning").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) =>
    serviceControllerRequirements.createRequirementsWarning(req, res),
);
RequirementsRouter.route("/post/requirement/resignation").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) =>
    serviceControllerRequirements.createRequirementsResignation(req, res),
);
RequirementsRouter.route("/post/requeriments/contract").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.createContract(req, res),
);
RequirementsRouter.route("/post/requeriments/sales").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.createSales(req, res),
);
RequirementsRouter.route("/put/requirement/resignation").put(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.ResignationUpdateUser(req, res),
);
RequirementsRouter.route("/search/requeriments/promoteds").get(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) =>
    serviceControllerRequirements.getAllRequirementsPromoteds(req, res),
);
RequirementsRouter.route("/search/requeriments/teams").get(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.getAllRequirementsTeams(req, res),
);
RequirementsRouter.route("/post/requirement/gratification").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) =>
    serviceControllerRequirements.createRequirementsGratification(req, res),
);
RequirementsRouter.route("/update/requirement/data").put(
  authGuard(["Admin", "Diretor", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.editRequirementData(req, res),
);
RequirementsRouter.route("/get/requirement/:id").get(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.getRequirementById(req, res),
);
RequirementsRouter.route("/post/requirement/exoneration").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) =>
    serviceControllerRequirements.createRequirementsExoneration(req, res),
);
RequirementsRouter.route("/post/requirement/permission").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) =>
    serviceControllerRequirements.createRequirementsPermission(req, res),
);
RequirementsRouter.route("/post/requeriments/cadet").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.createCadet(req, res),
);
RequirementsRouter.route("/edit/requeriments/cadet").put(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.updateCadet(req, res),
);
RequirementsRouter.route("/delete/requeriments/cadet").delete(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.deleteCadet(req, res),
);
RequirementsRouter.route("/post/requeriments/transfer").post(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.createTransfer(req, res),
);
RequirementsRouter.route("/edit/requeriments/transfer").put(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.updateTransfer(req, res),
);
RequirementsRouter.route("/delete/requeriments/transfer").delete(
  authGuard(["Admin", "Diretor", "User", "Recursos Humanos"]),
  (req, res) => serviceControllerRequirements.deleteTransfer(req, res),
);

export default RequirementsRouter;
