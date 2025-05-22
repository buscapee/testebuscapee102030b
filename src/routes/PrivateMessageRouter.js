import express from 'express';
import PrivateMessageController from '../controllers/PrivateMessageController.js';
import { authGuard } from '../Middleware/authGuard.js';

const router = express.Router();
const controller = new PrivateMessageController();

// Todas as rotas exigem autenticação
router.post('/', authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']), (req, res) => controller.sendMessage(req, res));
router.get('/inbox', authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']), (req, res) => controller.inbox(req, res));
router.get('/sent', authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']), (req, res) => controller.sent(req, res));
router.put('/:id/read', authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']), (req, res) => controller.markAsRead(req, res));
router.delete('/:id', authGuard(['Admin', 'Diretor', 'User', 'Recursos Humanos']), (req, res) => controller.deleteMessage(req, res));

export default router; 