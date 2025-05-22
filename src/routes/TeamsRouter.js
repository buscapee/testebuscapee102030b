import express from "express"
import ServiceControllerTeams from "../controllers/teamsController.js";
import { authGuard } from "../Middleware/authGuard.js";

const TeamsRouter = express.Router();
const serviceControllerTeams = new ServiceControllerTeams();

TeamsRouter.route('/teams/create').post(authGuard(['Admin', "Diretor"]),(req, res) => serviceControllerTeams.createTeams(req, res));
TeamsRouter.route('/teams/update/').put(authGuard(['Admin', "Diretor"]),(req, res) => serviceControllerTeams.updateTeams(req, res))
TeamsRouter.route('/searchTeams').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerTeams.searchTeams(req, res))
TeamsRouter.route('/teams/all').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerTeams.getAllTeams(req, res))
TeamsRouter.route('/teams/delete').delete(authGuard(['Admin', "Diretor"]),(req, res) => serviceControllerTeams.deleteTeams(req, res))
TeamsRouter.route('/teams/info').get(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerTeams.returnInfoTeams(req, res));
TeamsRouter.route('/teams/add').put(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerTeams.addUserTeams(req, res))
TeamsRouter.route('/teams/remove').put(authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']),(req, res) => serviceControllerTeams.RemoveUserTeams(req, res))
TeamsRouter.route('/teams/:id/hierarquia').patch(authGuard(['Admin', 'Diretor']), (req, res) => serviceControllerTeams.updateHierarquia(req, res));

export default TeamsRouter;