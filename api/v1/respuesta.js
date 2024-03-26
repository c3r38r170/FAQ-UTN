import * as express from "express";
import { Sequelize } from "sequelize";
import { moderarWithRetry } from "./ia.js";
import {
  ReportePost,
  Pregunta,
  SuscripcionesPregunta,
  Post,
  Respuesta,
  Notificacion,
} from "./model.js";
import { mensajeError401, mensajeError403, mensajeError404 } from "./mensajesError.js";


import { getModera, getRechazaPost, getReportaPost } from "./parametros.js";
const router = express.Router();


function crearRespuesta(req, res, respuestaIA = null) {
  let reportaPost = getReportaPost();
  Pregunta.findByPk(req.body.IDPregunta, {
    include: Post,
  }).then((pregunta) => {
    if (!pregunta) {
      // TODO Refactor: Probar early return, observar comportamiento del catch de abajo de todo.
      res.status(404).send(mensajeError404);
    } else {
      Post.create({
        cuerpo: req.body.cuerpo,
        duenioDNI: req.session.usuario.DNI,
      })
        .then((post) => {
          Respuesta.create({
            ID: post.ID,
            preguntaID: req.body.IDPregunta,
          })
            .then((resp) => {
              // TODO Refactor: Esperar a todas las promesas creadas. Reducir la cantidad de catch y callbacks

              if (respuestaIA && respuestaIA.apropiado < reportaPost) {
                ReportePost.create({
                  tipoID: 1,
                  reportadoID: post.ID,
                });
              }
              resp.save();

              //Notificaciones
              //al suscripto al post le avisa que se respondió y le manda el id de la respuesta
              SuscripcionesPregunta.findAll({
                where: {
                  preguntaID: req.body.IDPregunta,
                  fecha_baja: null,
                  suscriptoDNI: {
                    [Sequelize.Op.ne]: req.session.usuario.DNI,
                  },
                },
              }).then((suscripciones) => {
                suscripciones.forEach((suscripcion) => {
                  Notificacion.create({
                    postNotificadoID: post.ID,
                    notificadoDNI: suscripcion.suscriptoDNI,
                  });
                });
              });

              // ! si adentro de send hay un int tira error porque piensa que es el status
              res.status(201).json({ID:post.ID, motivo:respuestaIA?.motivo});
            })
            .catch((err) => {
              res.status(500).send(err.message);
            });
        })
        .catch((err) => {
          res.status(500).send(err.message);
        });
    }
  }).catch((err) => {
    res.status(500).send(err.message);
  });
}

router.post("/", function (req, res) {
  let modera = getModera();
  let rechazaPost = getRechazaPost();
  if (modera == 1) {
    moderarWithRetry(req.body.cuerpo, 10)
      .then((respuesta) => {
        if (respuesta.apropiado < rechazaPost) {
          res.status(400).send("Texto rechazo por moderación automática. Razón: " + respuesta.motivo);
          return;
        }

        crearRespuesta(req, res, respuesta);
      });
  } else {
    crearRespuesta(req, res);
  }
});


router.patch("/", function (req, res) {
  Respuesta.findByPk(req.body.ID, {
    include: Post
  })
  .then((respuesta) => {
    if (!respuesta) {
      res.status(404).send(mensajeError404);
      return;
    } else {
      if (respuesta.post.duenioDNI != req.session.usuario.DNI) {
        res.status(403).send(mensajeError403);
        return;
      } else {
          const editarRespuesta=()=>{
            respuesta.post.cuerpo = req.body.cuerpo;
            respuesta.post.save();
            res.status(200).send(req.body.IDPregunta + "");
          }

          let modera = getModera();
          let reportaPost = getReportaPost();
          if (modera == 1) {
            moderarWithRetry(req.body.cuerpo, 10).then((resp) => {
              let rechazaPost = getRechazaPost();
              if (resp.apropiado < rechazaPost) {
                res.status(400).send("Texto rechazo por moderación automática. Razón: " + respuesta.motivo);
                return;
              }
              if (resp.apropiado < reportaPost) {
                //Crear reporte
                ReportePost.create({
                  tipoID: 1,
                  reportadoID: respuesta.ID,
                });
              }
              editarRespuesta();
            });
          } else {
            editarRespuesta();
          }
        }
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});



export { router };