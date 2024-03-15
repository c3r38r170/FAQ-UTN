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

/*
Ejemplos de respuestas para seguir

401 --> res.status(401).send({ message: "Usuario no posee permisos" });
403 --> res.status(403).send({message: "No puede editar una pregunta ajena."});
404 --> res.status(404).json({ message: "Entidad no encontrada" });
400 --> res.status(400).json({ message: error.message });

201 --> res.status(201).json(Entidad);
200 --> res.status(200).send(); || res.status(200).send(Entidad) si es necesario

500 --> res.status(500).send({ message: error.message });

*/
