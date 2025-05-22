import { Router } from "express";
import ClasseRouter from "./ClasseRouter.js";
import DocsRouter from "./DocsRouter.js";
import EndorsementRouter from "./EndorsementRouter.js";
import LoggerRouter from "./LoggerRouter.js";
import PublicationRouter from "./PublicationRouter.js";
import RequirementsRouter from "./RequirementsRouter.js";
import RhRouter from "./RhRouter.js";
import SystemRouter from "./SystemRouter.js";
import TeamsRouter from "./TeamsRouter.js";
import UserRouter from "./UserRouter.js";
import ImagesRouter from "./ImagesRouter.js";
import ServicePointRouter from "./ServicePointRouter.js";
import ShopRouter from "./ShopRouter.js";
import PrivateMessageRouter from "./PrivateMessageRouter.js";
import ForumGroupRouter from './ForumGroupRouter.js';
import ForumTopicRouter from './ForumTopicRouter.js';

const AppRoutes = Router();

AppRoutes.use("/", ClasseRouter, DocsRouter, EndorsementRouter, LoggerRouter, PublicationRouter, RequirementsRouter, RhRouter, SystemRouter, TeamsRouter, UserRouter, ImagesRouter);
AppRoutes.use("/servicepoints", ServicePointRouter);
AppRoutes.use("/shop", ShopRouter);
AppRoutes.use("/private-message", PrivateMessageRouter);
AppRoutes.use('/forum-groups', ForumGroupRouter);
AppRoutes.use('/forum-topics', ForumTopicRouter);
AppRoutes.use('/forum-replies', (await import('./ForumReplyRouter.js')).default);

export default AppRoutes;