import * as express from "express";
import {
	Usuario,
	Perfil,
	Permiso,
	Pregunta,
	SuscripcionesPregunta,
	Post,
	Etiqueta,
	EtiquetasPregunta,
	Categoria,
	Parametro,
} from "./model.js";

import { getPaginacion } from "./parametros.js";

const router = express.Router();

router.get('/', function (req, res) {
	// TODO Feature faltan la cantidad de respuestas
	let parametros = { pagina: req.query.pagina || 0, filtrar: {} };
	parametros.filtrar.suscripto = req.session.usuario.DNI;
	Pregunta.pagina(parametros)
		.then((preguntas) => {
			res.status(200).send(preguntas);
		})
		.catch((err) => {
			res.status(500).send(err.message);
		});
})



export { router };