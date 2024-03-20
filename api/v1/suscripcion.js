import * as express from "express";
import {Pregunta} from "./model.js";

const router = express.Router();

router.get('/', function (req, res) {
	// TODO Feature faltan la cantidad de respuestas
	let parametros = { pagina: req.query.pagina || 0, filtrar: {suscripciones: true},usuarioActual:req.session.usuario };
	Pregunta.pagina(parametros)
		.then((preguntas) => {
			res.status(200).send(preguntas);
		})
		.catch((err) => {
			res.status(500).send(err.message);
		});
})



export { router };