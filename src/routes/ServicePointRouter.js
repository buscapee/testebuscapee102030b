import express from 'express';
import ServicePointController from '../controllers/servicePointController.js';

const router = express.Router();

router.post('/iniciar', ServicePointController.criarTurno);
router.get('/abertos', ServicePointController.listarTurnosAbertos);
router.post('/encerrar', ServicePointController.encerrarTurno);
router.patch('/setor', ServicePointController.patchTrocarSetor);
router.get('/usuario/:nickname', ServicePointController.listarTurnosUsuario);
router.get('/all', ServicePointController.listarTodosTurnos);
router.get('/relatorio', ServicePointController.relatorioUsuario);
router.get('/ranking', ServicePointController.rankingSemanal);

export default router; 