import express from 'express';
import ForumGroupController from '../controllers/ForumGroupController.js';
import { authGuard } from '../Middleware/authGuard.js';

const router = express.Router();
const controller = new ForumGroupController();

router.post('/', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.create(req, res));
router.get('/', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.list(req, res));
router.put('/:id', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.update(req, res));
router.delete('/:id', authGuard(['Admin', 'Diretor', 'User']), (req, res) => controller.remove(req, res));

export default router; 