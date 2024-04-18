import * as express from "express";
import { Sequelize } from "sequelize";
import {
	Usuario,
	Pregunta,
	Post,
	Respuesta,
	Notificacion,
	Parametro,
} from "./model.js";

import { getPaginacion } from "./parametros.js";
import { mensajeError403, mensajeError404 } from "./mensajesError.js";

const router = express.Router();

// TODO Refactor: Minimizar datos que envia este endpoint.
router.get('/', function (req, res) {
	// pregunta
	// 	propia
	// 		valoraciones, cantidad n
	// 	ajena
	// 		nueva pregunta, siempre es 1, suscripcion a etiqueta
	// respuesta
	// 	propia
	// 		Valoracion, cantidad n
	// 	ajena
	// 		nuevas respuestas, cantidad n, Suscripcion a pregunta

	//ppregunta ajena es notificacion por etiqueta suscripta
	// preguntaID not null es "nueva pregunta a etiqueta"
	//respuesta ajena es notificacion por respuesta a pregunta propia o suscripta
	//respuesta o pregunta propia es notificación por valoración
	// nuevos votos en tu pregunta...
	// nuevos votos en tu respuesta a ...
	let PAGINACION = getPaginacion();
	Notificacion.findAll({
		attributes: ['ID', 'visto', 'createdAt'],
		order: [
			['visto', 'ASC'],
			['createdAt', 'DESC']
		],

		limit: PAGINACION.resultadosPorPagina,
		offset: (+req.query.pagina) * PAGINACION.resultadosPorPagina,
		include: [
			{
				model: Post,
				attributes: [/* 'ID', 'cuerpo' */],
				// TODO Refactor: DRY
				where:{eliminadorDNI: null },
				required: true,
				include: [
					{ model: Usuario, as: 'duenio', attributes: [/* 'DNI', 'nombre' */] },
					{
						model: Respuesta
						, as: 'respuesta'
						, include: [
							{model:Post,where:{eliminadorDNI: null},attributes:[], required:true},
							{ model: Pregunta, as: 'pregunta', attributes: [/* 'ID', 'titulo' */], include:{model:Post,where:{eliminadorDNI: null},attributes:[], required:true} } // *Include Pregunta in Respuesta
						],
						required: false,
						attributes: [/* 'ID', 'preguntaID' */]
					},
					{ model: Pregunta, as: 'pregunta', required: false, attributes: [/* 'ID', 'titulo' */] }
				]
			}
		],
		where: {
			//'$post.pregunta.ID$': { [Sequelize.Op.ne]: null }, // *Check if the post is a question
			notificadoDNI: req.session.usuario.DNI // *Filter by notificadoDNI matching user's DNI
		},
		replacements:[req.session.usuario.DNI],
		attributes: [
			[Sequelize.fn('min', Sequelize.col('notificacion.visto')), 'visto']
			, [Sequelize.fn('max', Sequelize.col('notificacion.createdAt')), 'createdAt']
			, [Sequelize.fn('count', Sequelize.col('*')), 'cantidad']
			, [Sequelize.literal(`IF(post.duenioDNI=?,1,0)`), 'propia']
			, [Sequelize.fn('coalesce', Sequelize.col('post.respuesta.pregunta.titulo'), Sequelize.col('post.pregunta.titulo')), 'titulo']

			, [Sequelize.col('post.respuesta.preguntaID'), 'respuestaPreguntaID']
			, [Sequelize.col('post.pregunta.ID'), 'preguntaID']
		],
		group: [
			'propia'
			, 'post.respuesta.preguntaID'
			, 'post.pregunta.ID'
		],
		raw: true,
		nest: true
	}).then(notificaciones => {
		res.status(200).send(notificaciones);
	}).catch(err=>{
		res.status(500).send(err.message);
	});
});

router.patch("/", function (req, res) {
	let notificacionID = req.body.ID;

	if (!notificacionID) {
		res.status(400).send();
		return;
	}

  Notificacion.findByPk(notificacionID)
    .then((notificacion) => {
      if (!notificacion) {
        res.status(404).send(mensajeError404);
        return;
      }

      if (notificacion.notificadoDNI != req.session.usuario.DNI) {
        res.status(403).send(mensajeError403);
        return;
      }

      notificacion.visto = true;
      return notificacion.save();
    })
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});



export { router };