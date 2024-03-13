import * as express from "express";
import { Sequelize } from "sequelize";
import {
    Usuario,
    Perfil,
    Permiso,
    Voto,
    ReportePost,
    Pregunta,
    Post,
    Respuesta,
    Notificacion,
    Parametro
  } from "./model.js";

  import { getPaginacion } from "./parametros.js";

const router = express.Router();


// valoracion
// TODO Feature: No permitir autovotarse.

const valorarPost = function (req, res) {
    //res tendría idpregunta
    //la valoracion(true es positiva, false negativa)
    //el usuario viene con la sesión
    //TODO: Refactor en vez de borrar el voto ponerle un campo, asi creamos la noti solo si el voto es nuevo, no si te vuelve loco poniendo y sacando
  
    if (!req.session.usuario) {
      res.status(401).send("Usuario no tiene sesión válida activa.");
      return;
    }
  
    // TODO Refactor: ver si es posible traer solo un si existe
    let IDvotado = req.params.votadoID;
  
    Post.findByPk(IDvotado)
      .then((post) => {
        if (!post) {
          res.status(404).send("Post no encontrado / disponible.");
          return;
        } else {
          Voto.findAll({
            where: {
              votadoID: IDvotado,
              votanteDNI: req.session.usuario.DNI,
            },
            nest: true,
            plain: true,
          }).then((voto) => {
            if (!voto) {
              // si no exite el voto lo crea con lo que mandó
              if (req.body.valoracion == "null") {
                res.status(403).send("No existe la valoracion");
              } else {
                if (req.body.valoracion) {
                  Voto.create({
                    valoracion: req.body.valoracion,
                    votadoID: IDvotado,
                    votanteDNI: req.session.usuario.DNI,
                  }).then((v) => v.save());
                  Notificacion.create({
                    postNotificadoID: post.ID,
                    notificadoDNI: post.duenioDNI,
                  });
                }
              }
            } else {
              voto.valoracion = req.body.valoracion;
              voto.save();
              //Notificación
            }
            res.status(201).send("Voto registrado.");
          });
        }
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  };
  
  const eliminarVoto = function (req, res) {
    if (!req.session.usuario) {
      res.status(401).send("Usuario no tiene sesión válida activa.");
      return;
    }
    let IDvotado = req.params.votadoID;
    Post.findByPk(IDvotado)
      .then((post) => {
        if (!post) {
          res.status(404).send("Post no encontrado / disponible.");
          return;
        } else {
          Voto.findAll({
            where: {
              votadoID: IDvotado,
              votanteDNI: req.session.usuario.DNI,
            },
            nest: true,
            plain: true,
          }).then((voto) => {
            if (!voto) {
              res.status(403).send("No existe la valoración");
            } else {
              voto.destroy();
            }
            res.status(201).send("Voto Eliminado.");
          });
        }
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  };
  
  // TODO Feature: Hacer las funciones anónimas, si ya no hace falta usarlas en diferentes lugares. valorar, eliminarVoto, y reportarPost
  
  router.post("/:votadoID/valoracion", valorarPost);
  
  router.delete("/:votadoID/valoracion", eliminarVoto);
  
  //reporte post
  
  const reportarPost = function (req, res) {
    // TODO Refactor: ocupar la sesión activa válida en el server.js así no hay que repetirlo a cada rato
    if (!req.session.usuario) {
      res.status(401).send("Usuario no tiene sesión válida activa");
      return;
    }
  
    let reportadoID = req.params.reportadoID;
    Post.findByPk(reportadoID)
      .then((pregunta) => {
        if (!pregunta) {
          res.status(404).send("Pregunta/respuesta no encontrada");
          return;
        } else {
          // TODO Feature: ver si ya se reportó, y prohibir
          // Se podría hacer un get a los reportes y si ya existe que aparezca mensajito de ya está reportado y directamente no te aparezca el form
          // TODO Feature: determinar tipos
          ReportePost.create({
            tipoID: req.body.tipoID || 1,
            reportanteDNI: req.session.usuario.DNI,
            reportadoID: reportadoID,
          }).then((r) => 
          r.save()
          );
          res.status(201).send("Reporte registrado");
        }
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  };
  
router.post("/:reportadoID/reporte", reportarPost);
  
  // TODO Feature: Los reportes no se eliminan. Solo se actua sobre ellos (eliminando o unificando) o se ignoran. Esta ignoración podría ser interesante de implementar.
  //Eliminamos el reporte? o agregamos algun campo que diga si fue tratado(y por quien)
  /* ReportePost.findAll({
    where: { ID: req.body.IDReporte },
    raw: true,
    nest: true,
    plain: true,
  })
    .then((reporte) => {
      if (!reporte) {
        res.status(404).send("Reporte no encontrado");
        return;
      } else {
        reporte.destroy();
        res
          .status(200)
          .send("Estado del post consistente con interfaz");
        return;
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    }); */
  
  router.delete('/:ID',(req,res) => {
    if (!req.session.usuario) {
      res
        .status(401)
        .send("No se posee sesión válida activa");
      return;
    } else if (req.session.usuario.perfil.permiso.ID < 2) {
      res
        .status(403)
        .send("No se poseen permisos de moderación");
      return;
    }
  
    Post.findByPk(req.params.ID,{
      include:{model:Usuario,as:'eliminador'}
    })
      .then((post) => {
        if (!post) {
          res.status(404).send("Pregunta no encontrada");
          return;
        }
  
        post.setEliminador(req.session.usuario.DNI)
          .then((post)=>post.save())
          .then(()=>{
            res.status(200).send("Estado del post consistente con interfaz");
          })
      })
  })

  
router.get('/reporte',function(req, res){
	let pagina=req.query.pagina||0;
  let PAGINACION = getPaginacion();
	ReportePost.findAll({
		limit: PAGINACION.resultadosPorPagina,
		offset: (+pagina) * PAGINACION.resultadosPorPagina,
		// subQuery:false,
		// separate: true,
		include: [
		  {
				model: Post,
				attributes: ['cuerpo','fecha'],
				required:true,
				as:'reportado',
				include: [
					{
						model:Usuario
						,as:'duenio'
						,include:{
							model:Perfil
							,attributes:['ID','nombre', 'color']
						}
						,attributes:['DNI','nombre']
					},

					{
						model: Respuesta
						, as: 'respuesta',
						include: [
							{model:Post, attributes: []},
							{ model: Pregunta, as: 'pregunta', attributes: [] } // *Include Pregunta in Respuesta
						],
						required: false,
						attributes: [] 
					},  
					{ model: Pregunta, as: 'pregunta', required: false, include:{model:Post, attributes: []}, attributes: [] } 
				]
		  }
		],
		attributes:[
			// * Orgánicamente se obtienen los datos comunes de los posts (cuerpo y fecha), y los datos del usuario (propios y de su perfil).

			// * Datos de la pregunta o respuesta
			[Sequelize.fn('coalesce',Sequelize.col('reportado.respuesta.pregunta.ID'),Sequelize.col('reportado.pregunta.ID')),'reportado.preguntaID']
			,[Sequelize.fn('coalesce',Sequelize.col('reportado.respuesta.pregunta.titulo'),Sequelize.col('reportado.pregunta.titulo')),'reportado.titulo']
			,[Sequelize.col('reportado.respuesta.ID'),'reportado.respuestaID']
			
			// * Datos resumen de los reportes.
			,[Sequelize.fn('max',Sequelize.col('reportePost.fecha')),'fecha']
			,[Sequelize.fn('count',Sequelize.col('*')),'cantidad']
      // TODO Refactor: Es horrible que tengamos que buscar en un string en vez de un array.
			,[Sequelize.fn('group_concat',Sequelize.fn('distinct',Sequelize.col('reportePost.tipoID'))),'tiposIDs']
		],
    nest:true,raw:true
    // ? Supuestamente hay que agrupar por todos los datos atómicos, pero esto funciona ya. Considerar si nos debemos basar en la teoría o en la práctica.
    /* cuerpo,fecha,DNI,nombre,perfilID,perfilNombre,perfilColor */
		,group:[
			'reportado.ID'
		]
		,order:[
			['fecha','DESC']
		]
	})
		.then(reportes=>res.send(reportes));
})




export { router };