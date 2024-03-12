import * as express from "express";

const router = express.Router();

import {router as CategoriaRouter} from "./categoria.js";
import {router as EtiquetaRouter} from "./etiqueta.js";
import {router as NotificacionRouter} from "./notificacion.js";
import {router as ParametroRouter} from "./parametro.js";
import {router as PerfilRouter} from "./perfil.js";
import {router as PostRouter} from "./post.js";
import {router as PreguntaRouter} from "./pregunta.js";
import {router as RespuestaRouter} from "./respuesta.js";
import {router as SesionRouter} from "./sesion.js";
import {router as SuscripcionRouter} from "./suscripcion.js";
import {router as UsuarioRouter} from "./usuario.js";

router.use('/categoria', CategoriaRouter);
router.use('/etiqueta', EtiquetaRouter);
router.use('/notificacion', NotificacionRouter);
router.use('/parametro', ParametroRouter);
router.use('/perfil', PerfilRouter);
router.use('/post', PostRouter);
router.use('/pregunta', PreguntaRouter);
router.use('/respuesta', RespuestaRouter);
router.use('/sesion', SesionRouter);
router.use('/suscripcion', SuscripcionRouter);
router.use('/usuario', UsuarioRouter);

export { router };
