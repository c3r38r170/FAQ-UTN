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

// TODO Refactor: "suscripcion"? Todos los demás endpoints están en singular.
router.get('/', function (req, res) {
	//TODO Feature: acomodar el filtro para que no encuentre suscripciones dadas de baja. fecha_baja, ver si conviene volver a las relaciones como antes...

	// TODO Feature Poner en Pregunta.pagina para tener también las suscripciones (aca hace falta?? sabemos que todas estas lo incluyen, quizá poner en el frontend. Esto haría un parámetro de si hacen falta los votos o no)
	// TODO Feature Usar Pregunta.pagina para tener todos los datos unificados, como los votos
	// TODO Feature faltan la cantidad de respuestas

	const pagina = req.query.pagina || 0;
	let PAGINACION = getPaginacion();
	Pregunta.findAll({
		attributes: ["ID", "titulo", "fecha"],
		include: [
			{
				model: Post,
				as: 'post',
				attributes: ["ID", "cuerpo", "fecha"],
				include: [
					{
						model: Usuario,
						as: 'duenio',
						attributes: ["DNI", "nombre", "perfilID"],
						include: {
							model: Perfil,
							attributes: ["ID", "color", "permisoID", "descripcion", "activado"]
						}
					}
				]
			},
			{
				model: EtiquetasPregunta,
				as: 'etiquetas',
				attributes: [],
				include: {
					model: Etiqueta,
					attributes: ["ID", "descripcion", "categoriaID", "activado"],
					include: {
						model: Categoria,
						as: "categoria",
						attributes: ["ID", "descripcion", "color", "activado"]
					},
				}
			},
			{
				model: Usuario,
				attributes: ["DNI", "Nombre"]
				, where: {
					DNI: req.session.usuario.DNI
				}
				, as: 'usuariosSuscriptos',
				through: {
					model: SuscripcionesPregunta,
					attributes: [],
					where: {
						fecha_baja: null // * Condición para que la fecha de baja sea nula
					}
				}
			}
		],
		subQuery: false,
		order: [[Post, 'fecha', 'DESC']],
		limit: PAGINACION.resultadosPorPagina,
		offset: (+pagina) * PAGINACION.resultadosPorPagina,
	})
		.then((suscripciones) => {
			res.status(200).send(suscripciones);
		})
		.catch(err => {
			res.status(500).send(err);
		})
})



export { router };