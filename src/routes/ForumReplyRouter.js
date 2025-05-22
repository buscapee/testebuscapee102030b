import express from 'express';
import ForumReplyController from '../controllers/ForumReplyController.js';
import { authGuard } from '../Middleware/authGuard.js';

const router = express.Router();
const controller = new ForumReplyController();

router.post('/', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.create(req, res));
router.get('/', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.list(req, res));
router.put('/:id', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.update(req, res));
router.delete('/:id', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.remove(req, res));
router.get('/count', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.countReplies(req, res));

export default router; 