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
  Parametro,
  SuscripcionesPregunta,
  SuscripcionesEtiqueta,
  Bloqueo
} from "./model.js";

import { getPaginacion } from "./parametros.js";
import { mensajeError401, mensajeError403, mensajeError404 } from "./mensajesError.js";

const router = express.Router();

//valoracion
router.post("/:votadoID/valoracion", function (req, res) {
  //res tendría idpregunta
  //la valoracion(true es positiva, false negativa)
  //el usuario viene con la sesión
  //TODO: Refactor en vez de borrar el voto ponerle un campo, asi creamos la noti solo si el voto es nuevo, no si te vuelve loco poniendo y sacando

  // TODO Refactor: ver si es posible traer solo un si existe
  let IDvotado = req.params.votadoID;

  Post.findByPk(IDvotado)
    .then((post) => {
      if (!post) {
        res.status(404).send(mensajeError404);
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
              res.status(403).send(mensajeError403);
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
      res.status(500).send(err.message);
    });
});

router.delete("/:votadoID/valoracion", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send(mensajeError401);
    return;
  }
  let IDvotado = req.params.votadoID;
  Post.findByPk(IDvotado)
    .then((post) => {
      if (!post) {
        res.status(404).send(mensajeError404);
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
            res.status(403).send(mensajeError403);
          } else {
            voto.destroy();
          }
          res.status(201).send("Voto Eliminado.");
        });
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

//reporte post

router.post("/:reportadoID/reporte", function (req, res) {
  // TODO Refactor: ocupar la sesión activa válida en el server.js así no hay que repetirlo a cada rato

  let reportadoID = req.params.reportadoID;
  Post.findByPk(reportadoID)
    .then((pregunta) => {
      if (!pregunta) {
        res.status(404).send(mensajeError404);
        return;
      } else {
        // TODO Feature: ver si ya se reportó, y prohibir
        // Se podría hacer un get a los reportes y si ya existe que aparezca mensajito de ya está reportado y directamente no te aparezca el form
        // TODO Feature: determinar tipos
        ReportePost.findOne({
          where: {
            reportadoID: reportadoID,
            reportanteDNI: req.session.usuario.DNI
          }
        }).then(re => {
          if (re) {
            re.fecha = Date.now();
            re.save();
          } else {
            ReportePost.create({
              tipoID: req.body.tipoID || 1,
              reportanteDNI: req.session.usuario.DNI,
              reportadoID: reportadoID,
            })
          }
          res.status(201).send("Reporte registrado");
          return;
        })
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

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

router.delete('/:ID', (req, res) => {

  Post.findByPk(req.params.ID, {
    include: { model: Usuario, as: 'eliminador' }
  })
    .then((post) => {
      if (!post) {
        res.status(404).send(mensajeError404);
        return;
      }

      if (req.session.usuario.DNI != post.duenioDNI && req.session.usuario.perfil.permiso.ID < 2) {
        res.status(403).send(mensajeError403);
        return;
      }

      post.setEliminador(req.session.usuario.DNI)
        .then((post) => post.save())
        .then(() => {
          // ! Cast a string o nos butea express (piensa que pasamos un código.).
          res.status(200).send(`${post.ID}`);
        })
    })
})

router.patch('/:ID/restaurar', (req, res) => {
  Post.findByPk(req.params.ID, {
    include: { model: Usuario, as: 'eliminador' }
  })
    .then((post) => {
      if (!post) {
        res.status(404).send(mensajeError404);
        return;
      }

      if (req.session.usuario.DNI != post.duenioDNI && req.session.usuario.perfil.permiso.ID < 2) {
        res.status(403).send(mensajeError403);
        return;
      }

      post.setEliminador(null)
        .then((post) => post.save())
        .then(() => {
          res.status(200).send("Se ha restaurado el post");
        })
    })
})



router.get('/reporte', function (req, res) {
  let pagina = req.query.pagina || 0;
  let PAGINACION = getPaginacion();
  ReportePost.findAndCountAll({
    limit: PAGINACION.resultadosPorPagina,
    offset: (+pagina) * PAGINACION.resultadosPorPagina,
    subQuery: false,
    //separate: false,
    include: [
      {
        model: Post,
        attributes: ['cuerpo', 'fecha'],
        required: true,
        as: 'reportado',
        include: [
          {
            model: Usuario
            , as: 'duenio'
            , include: {
              model: Perfil
              , attributes: ['ID', 'descripcion', 'color']
            }
            , attributes: ['DNI', 'nombre']
          },

          {
            model: Respuesta
            , as: 'respuesta',
            include: [
              { model: Post, attributes: [] },
              { model: Pregunta, as: 'pregunta', attributes: [] } // *Include Pregunta in Respuesta
            ],
            required: false,
            attributes: []
          },
          { model: Pregunta, as: 'pregunta', required: false, include: { model: Post, attributes: [] }, attributes: [] }
        ]
      }
    ],
    attributes: [
      // * Orgánicamente se obtienen los datos comunes de los posts (cuerpo y fecha), y los datos del usuario (propios y de su perfil).

      // * Datos de la pregunta o respuesta
      [Sequelize.fn('coalesce', Sequelize.col('reportado.respuesta.pregunta.ID'), Sequelize.col('reportado.pregunta.ID')), 'reportado.preguntaID']
      , [Sequelize.fn('coalesce', Sequelize.col('reportado.respuesta.pregunta.titulo'), Sequelize.col('reportado.pregunta.titulo')), 'reportado.titulo']
      , [Sequelize.col('reportado.respuesta.ID'), 'reportado.respuestaID']

      // * Datos resumen de los reportes.
      , [Sequelize.fn('max', Sequelize.col('reportePost.fecha')), 'fecha']
      , [Sequelize.fn('count', Sequelize.col('*')), 'cantidad']
      // TODO Refactor: Es horrible que tengamos que buscar en un string en vez de un array.
      , [Sequelize.fn('group_concat', Sequelize.fn('distinct', Sequelize.col('reportePost.tipoID'))), 'tiposIDs']
    ],
    nest: true, raw: true
    // ? Supuestamente hay que agrupar por todos los datos atómicos, pero esto funciona ya. Considerar si nos debemos basar en la teoría o en la práctica.
    /* cuerpo,fecha,DNI,nombre,perfilID,perfilNombre,perfilColor */
    , where: {
      [Sequelize.Op.or]: [
        { '$reportado.duenioDNI$': { [Sequelize.Op.substring]: req.query.searchInput } },
        { '$reportado.duenio.nombre$': { [Sequelize.Op.substring]: req.query.searchInput } },
        { '$reportado.cuerpo$': { [Sequelize.Op.substring]: req.query.searchInput } },
        { '$reportado.pregunta.titulo$': { [Sequelize.Op.substring]: req.query.searchInput } }
      ]
    }
    , group: [
      'reportado.ID'
    ]
    , order: [
      ['fecha', 'DESC']
    ]
  })
    .then(reportes => {
      res.setHeader('untfaq-cantidad-paginas', Math.ceil(reportes.count.length / PAGINACION.resultadosPorPagina));
      res.status(200).send(reportes.rows);
    });
})


router.get("/masNegativos", function (req, res) {
  Post.findAll({
    attributes: [[Sequelize.fn('SUM', Sequelize.col('valoracion')), 'valoracion'], 'cuerpo', 'ID'],
    include: [
      {
        model: Voto,
        attributes: [],
        required: true
      },
      {
        model: Pregunta,
        as: 'pregunta',
        attributes: ["titulo", "ID"]
      },
      {
        model: Respuesta,
        as: 'respuesta',
        attributes: ["ID"],
        include: [
          {
            model: Pregunta,
            as: 'pregunta',
            include: {
              model: Post,
              include: {
                model: Usuario
                , as: 'duenio'
                , include: {
                  model: Perfil
                  , attributes: ['ID', 'descripcion', 'color']
                }
                , attributes: ['DNI', 'nombre']
              },
            }
          }
        ]
      },
      {
        model: Usuario
        , as: 'duenio'
        , include: {
          model: Perfil
          , attributes: ['ID', 'descripcion', 'color']
        }
        , attributes: ['DNI', 'nombre']
      },
    ],
    order: [[Sequelize.literal('SUM(valoracion)'), 'ASC']],
    group: ['ID'],
    subQuery: false,
    limit: getPaginacion().resultadosPorPagina,
  })
    .then(posts => {
      // Etiquetas ordenadas por uso
      res.status(200).send(posts)
    })
    .catch(error => {
      res.status(400).send(error.message);
    });
});


router.get("/estadisticas", async function (req, res) {
  //con promises en vez de await porque son muchas consultas y tarda mucho si no las hace en paralelo
  const obtenerEstadisticas = async () => {
    const estadisticas = [
      { nombre: 'Preguntas', valor: 0, ultimoMes: 0 },
      { nombre: 'Posts', valor: 0, ultimoMes: 0 },
      { nombre: 'Votos', valor: 0, ultimoMes: 0 },
      { nombre: 'Bloqueos', valor: 0, ultimoMes: 0 },
      { nombre: 'Suscripciones', valor: 0, ultimoMes: 0 }
    ];

    // Consultas para obtener el valor total y el valor del último mes para cada estadística
    const consultas = [
      Pregunta.count(),
      Post.count(),
      Voto.count(),
      Bloqueo.count(),
      SuscripcionesPregunta.count(),
      SuscripcionesEtiqueta.count(),
      Pregunta.count({ where: { createdAt: { [Sequelize.Op.between]: [fechaInicioMesPasado, fechaInicioMesActual] } } }),
      Post.count({ where: { fecha: { [Sequelize.Op.between]: [fechaInicioMesPasado, fechaInicioMesActual] } } }),
      Voto.count({ where: { createdAt: { [Sequelize.Op.between]: [fechaInicioMesPasado, fechaInicioMesActual] } } }),
      Bloqueo.count({ where: { fecha: { [Sequelize.Op.between]: [fechaInicioMesPasado, fechaInicioMesActual] } } }),
      SuscripcionesPregunta.count({ where: { createdAt: { [Sequelize.Op.between]: [fechaInicioMesPasado, fechaInicioMesActual] } } }),
      SuscripcionesEtiqueta.count({ where: { createdAt: { [Sequelize.Op.between]: [fechaInicioMesPasado, fechaInicioMesActual] } } })
    ];

    const resultados = await Promise.all(consultas);

    estadisticas[0].valor = resultados[0];
    estadisticas[1].valor = resultados[1];
    estadisticas[2].valor = resultados[2];
    estadisticas[3].valor = resultados[3];
    estadisticas[4].valor = resultados[4] + resultados[5];
    estadisticas[0].ultimoMes = resultados[6];
    estadisticas[1].ultimoMes = resultados[7];
    estadisticas[2].ultimoMes = resultados[8];
    estadisticas[3].ultimoMes = resultados[9];
    estadisticas[4].ultimoMes = resultados[10] + resultados[11];

    return estadisticas;
  };

  const fechaInicioMesActual = new Date();
  const fechaInicioMesPasado = new Date(fechaInicioMesActual);
  fechaInicioMesPasado.setMonth(fechaInicioMesActual.getMonth() - 1);

  const handleRequest = async (req, res) => {
    try {
      const estadisticas = await obtenerEstadisticas();
      res.status(200).send(estadisticas);
    } catch (error) {
      console.error('Error al obtener las estadísticas:', error);
      res.status(500).send('Error interno del servidor');
    }
  };
  handleRequest(req, res);
})

export { router };