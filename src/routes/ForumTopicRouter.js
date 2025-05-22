import express from 'express';
import ForumTopicController from '../controllers/ForumTopicController.js';
import { authGuard } from '../Middleware/authGuard.js';

const router = express.Router();
const controller = new ForumTopicController();

router.post('/', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.create(req, res));
router.get('/', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.list(req, res));
router.post('/:id/reply', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.reply(req, res));
router.delete('/:id', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.remove(req, res));
router.put('/:id', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.update(req, res));
router.put('/:id/resposta/:respostaId', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.editarResposta(req, res));
router.delete('/:id/resposta/:respostaId', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.apagarResposta(req, res));

export default router; 