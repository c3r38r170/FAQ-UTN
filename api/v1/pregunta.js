import * as express from "express";
import { Sequelize } from "sequelize";
import { moderarWithRetry } from "./ia.js";
import {
  Usuario,
  ReportePost, TipoReporte,
  Pregunta,
  SuscripcionesPregunta,
  Post,
  Respuesta,
  SuscripcionesEtiqueta,
  Notificacion,
  EtiquetasPregunta,
  Voto,
  Perfil,
} from "./model.js";
import { mensajeError403 } from "./mensajesError.js";

const router = express.Router();

import { getModera, getPaginacion, getRechazaPost, getReportaPost } from "./parametros.js";

router.get("/", (req, res) => {
  Pregunta.pagina({
    pagina: req.query.pagina || 0
    , filtrar: {
      texto: req.query.searchInput || undefined
      , etiquetas: req.query.etiquetas ?
        (Array.isArray(req.query.etiquetas) ? req.query.etiquetas : [req.query.etiquetas])
        : undefined
    }
    , formatoCorto: req.query.formatoCorto !== undefined
    , usuarioActual: req.session?.usuario
  })
    .then((preguntas) => {
      res.status(200).send(preguntas);
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

function editarPregunta(req, res, respuestaIA = null) {
}

router.patch("/", function (req, res) {
  Pregunta.findByPk(req.body.ID, {
    include: [
      Post
      , {
        model: EtiquetasPregunta,
        as: 'etiquetas',
      }
    ],
  })
    .then((pregunta) => {
      if (!pregunta) {
        res.status(404).send("Pregunta no encontrada");
        return;
      } else {
        if (pregunta.post.duenioDNI != req.session.usuario.DNI) {
          res.status(403).send(mensajeError403);
          return;
        } else {
          // TODO Refactor: DRY en este if
          let modera = getModera();
          let esperarA = []
          const editarPregunta = (motivo = null) => {
            pregunta.post.cuerpo = req.body.cuerpo;
            pregunta.titulo = req.body.titulo;

            const etiquetas = Array.isArray(req.body.etiquetas) ? req.body.etiquetas : [req.body.etiquetas];
            // !no se porque pero asi anda pregunta.save() no
            //TODO Refactor: Usar setEtiquetas.  etiquetas vienen los id en array
            // pregunta.setEtiquetas(
            //   req.body.etiquetasIDs.map(
            //     (ID) => new EtiquetasPregunta({ etiquetumID: ID })
            //   )
            // );
            // .then(ep => pregunta.setEtiquetas(req.body.etiquetas.map(
            //   (ID) =>({ preguntumID : pregunta.post.ID , etiquetumID: ID })
            // )))
            esperarA.push(
              pregunta.post.save()
                .then(() =>
                  pregunta.setEtiquetas([])
                )
                .then(pre => pre.save())
                .then(() =>
                  Promise.all(etiquetas.map(
                    (ID) => EtiquetasPregunta.create({ etiquetumID: ID, preguntumID: pregunta.post.ID })
                  ))
                )
            )
            Promise.all(esperarA)
              .then(() =>
                res.status(200).json({ ID: req.body.ID, motivo })
              )
          }

          if (modera == 1) {
            moderarWithRetry(req.body.titulo + " " + req.body.cuerpo, 50).then(
              (respuesta) => {
                let rechazaPost = getRechazaPost();
                if (respuesta.apropiado < rechazaPost) {
                  res
                    .status(400)
                    .send("Texto rechazo por moderación automática. Razón: " + respuesta.motivo);
                  return;
                }

                if (respuesta.apropiado < getReportaPost()) {
                  // * Crear reporte
                  esperarA.push(ReportePost.create({
                    tipoID: 1,
                    reportadoID: req.body.ID
                  }))

                  editarPregunta(respuesta.motivo);
                  return;
                }

                // TODO Refactor: DRY. No se si es posible igual, dejar comentario en todo caso.
                editarPregunta();
              }
            );
          } else editarPregunta();
        }
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

function crearPregunta(req, res, respuestaIA = null) {
  Post.create({
    cuerpo: req.body.cuerpo,
    duenioDNI: req.session.usuario.DNI,
  }).then((post) => {
    return Pregunta.create({
      ID: post.ID,
      titulo: req.body.titulo,
    })
  }).then((pregunta) => {
    // TODO Refactor: Se puede simplificar incluso más. Para empezar, poniendo todo lo del push obligatorio dentro de la definición.
    let esperarA = [];
    let reportaPost = getReportaPost();
    let reportado = false;
    if (respuestaIA && respuestaIA.apropiado < reportaPost) {
      esperarA.push(
        ReportePost.create({
          tipoID: 1,
          reportadoID: pregunta.ID,
        })
      );
      reportado = true;
    }
    //si es una tira error
    const etiquetasIDs = Array.isArray(req.body.etiquetasIDs) ? req.body.etiquetasIDs : [req.body.etiquetasIDs];
    esperarA.push(
      //etiquetas

      etiquetasIDs.forEach(id => {
        EtiquetasPregunta.create({
          preguntumID: pregunta.ID,
          etiquetumID: id
        })
      })
      /*Promise.all(req.body.etiquetasIDs.map(ID=>Etiqueta.findByPk(ID)))
        .then(etiquetas=>Promise.all(etiquetas.map(eti=>{
          let ep=new EtiquetasPregunta();
          ep.etiqueta=eti;
          return ep.save();
        })))
        .then(eps=>pregunta.setEtiquetas(eps))*/

      // Suscripciones a etiquetas
      , SuscripcionesEtiqueta.findAll({
        attributes: ['suscriptoDNI'],
        where: {
          etiquetaID: {
            [Sequelize.Op.in]: etiquetasIDs
          },
          fecha_baja: null
        },
        distinct: true
      }).then(suscripciones => {
        return Promise.all(suscripciones.map(suscripcion => Notificacion.create({
          postNotificadoID: pregunta.ID,
          notificadoDNI: suscripcion.suscriptoDNI
        })));
      })

      //Suscribe a su propia pregunta
      , Usuario.findByPk(req.session.usuario.DNI)
        .then(usu => pregunta.addUsuariosSuscriptos(usu))
    )

    Promise.all(esperarA)
      .then(() => pregunta.save())
      .then(() => {
        // ! Sin las comillas se piensa que pusimos el status dentro del send
        res.status(201).json({ ID: pregunta.ID, motivo: reportado ? respuestaIA.motivo : null });
      })
  })
    .catch(err => {
      res.status(500).send(err.message);
    })
}

router.post("/", function (req, res) {
  let modera = getModera();
  if (modera == 1) {
    moderarWithRetry(req.body.titulo + " " + req.body.cuerpo, 10)
      .then((respuesta) => {
        let rechazaPost = getRechazaPost();
        if (respuesta.apropiado < rechazaPost) {
          //esto anda
          // TODO UX: ¿Mandar respuesta del bot?
          res.status(400).send("Texto rechazo por moderación automática. Razón: " + respuesta.motivo);
          return;
        }
        //reporte en esta funcion
        crearPregunta(req, res, respuesta)
      })
      .catch((err) => {
        res.status(500).send(err.message);
      });
  } else crearPregunta(req, res)
})

router.put('/:ID', function (req, res) {
  let usuarioActual = req.session.usuario;
  if (usuarioActual.perfil.permiso.ID < 2) {
    res
      .status(403)
      .send(mensajeError403);
    return;
  }

  Pregunta.findByPk(req.params.ID, {
    include: [
      {
        model: Post, include: [
          { model: Usuario, as: 'eliminador' }
          // ,{model:ReportePost,include:{model:TipoReporte, as:'tipo',attributes:[]}}
        ]
      },
      { model: SuscripcionesPregunta, as: 'suscripciones' },
      { model: Respuesta, as: 'respuestas', include: Post },
      // TODO Refactor: Algún ENUM de tipos de reportes
    ]
  })
    .then(pre => {
      if (!pre) {
        // TODO Refactor: DRY en todos los "no se posee sesion", "no se poseen permisos", etc.
        res.status(404).send("Pregunta no encontrada");
        return;
      }

      // TODO Refactor: Ver si es posible simplificar
      let esperarA = []
        , preguntaReemplazoID = req.body.duplicadaID;

      if (pre.respuestas.length) {
        esperarA.push(...pre.respuestas.map(resp => resp.setPregunta(preguntaReemplazoID).then(r => r.save())));
      }

      esperarA.push(pre.post.setEliminador(usuarioActual.DNI).then(p => p.save()));

      // TODO Feature: Test this.
      esperarA.push(pre.getSuscripciones().then(suscripciones => Promise.all(suscripciones.map(suscripcion => suscripcion.setPregunta(preguntaReemplazoID).then(s => s.save())))));

      // TODO Feature: ¿Pasar reportes de otras índoles?
      // esperarA.push(pre.post.getReportePosts().then(reportes=>Promise.all(reportes.map(reporte => reporte.tipoID==2?/* ! 2 es pregunta repetida */reporte.destroy()))));

      Promise.all(esperarA).then(() => {
        res.send();
      })
    })
})

//Suscripción / desuscripción a pregunta

router.post("/:preguntaID/suscripcion", function (req, res) {
  //TODO Feature: acomodar el filtro para que no encuentre suscripciones dadas de baja

  let IDpregunta = req.params.preguntaID;

  Pregunta.findByPk(IDpregunta, { include: Post })
    .then((pregunta) => {
      if (!pregunta) {
        res.status(404).send("Pregunta no encontrada / disponible");
        return;
      } else {
        // TODO Refactor: Esto no hace falta, se puede hacer pregunta.SuscripcionesPregunta o algo así
        SuscripcionesPregunta.findAll({
          where: {
            preguntaID: IDpregunta,
            suscriptoDNI: req.session.usuario.DNI,
            fecha_baja: null,
          },
          nest: true,
          plain: true,
        })
          .then((sus) => {
            if (!sus) {
              SuscripcionesPregunta.create({
                suscriptoDNI: req.session.usuario.DNI,
                preguntaID: IDpregunta,
              }).then((susc) => susc.save());
              res.status(201).send(IDpregunta);
              return;
            } else {
              res.status(401).send("Ya se encuentra suscripto a la pregunta");
            }
          })
          .catch((err) => {
            res.status(500).send(err.message);
          });
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
  // TODO Refactor: ahorrar el callback hell, acá y en todos lados.
});



router.delete("/:preguntaID/suscripcion", function (req, res) {


  let IDpregunta = req.params.preguntaID;

  Pregunta.findByPk(IDpregunta, { include: Post })
    .then((pregunta) => {
      if (!pregunta) {
        res.status(404).send("Pregunta no encontrada / disponible");
        return;
      } else {
        // TODO Refactor: Esto no hace falta, se puede hacer pregunta.SuscripcionesPregunta o algo así
        SuscripcionesPregunta.findAll({
          where: {
            preguntaID: IDpregunta,
            suscriptoDNI: req.session.usuario.DNI,
            fecha_baja: {
              [Sequelize.Op.is]: null,
            },
          },
          nest: true,
          plain: true,
        })
          .then((sus) => {
            if (!sus) {
              res.status(404).send("No se encuentra suscripto a la pregunta");
              return;
            } else {
              sus.fecha_baja = new Date().toISOString().split("T")[0];
              //! el 204 no devuelve el mensaje
              sus.save().then(() => res.status(201).send(IDpregunta));
            }
          })
          .catch((err) => {
            res.status(500).send(err.message);
          });
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

router.get("/masVotadas", function (req, res) {
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(403).send(mensajeError403);
    return;
  }
  let resultadosPorPagina = getPaginacion().resultadosPorPagina;
  const respuestasCount = [
    Sequelize.literal(
      "(SELECT COUNT(*) FROM respuesta WHERE respuesta.preguntaID = pregunta.ID)"
    ),
    "respuestasCount",
  ]
  Pregunta.findAll({
    attributes: [
      [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('valoracion')), 0), 'valoracion'], // Utiliza COALESCE para mostrar 0 si la suma es null 
      'titulo',
      respuestasCount
    ],
    include: [
      {
        model: Post,
        where: { eliminadorDNI: null },
        // TODO Refactor: ver si no hace falta el required:true
        include: [
          {
            model: Voto,
            attributes: [],
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
        ]
      },
    ],
    group: ['ID'],
    order: req.query.respondidas ? [[Sequelize.literal(
      "(SELECT COUNT(*) FROM respuesta WHERE respuesta.preguntaID = pregunta.ID)"
    ), 'DESC']] : [[Sequelize.literal('valoracion'), 'DESC']],
    subQuery: false,
    limit: resultadosPorPagina
  })
    .then(preguntas => {
      // Etiquetas ordenadas por uso
      res.status(200).send(preguntas)
    })
    .catch(error => {
      res.status(400).send(error.message);
    });
});


export { router };