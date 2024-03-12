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


import { getModera, getRechazaPost, getReportaPost } from "./parametros.js";
const router = express.Router();



router.post("/", function (req, res) {
    if (!req.session.usuario) {
      res.status(401).send("Usuario no tiene sesión válida activa");
      return;
    }
    // TODO Refactor: Unificar if y else. Ver cuál es la versión más reciente de cada parte.
    let modera= getModera();
    let rechazaPost = getRechazaPost();
    let reportaPost = getReportaPost();
    if (modera==1) {
      moderarWithRetry(req.body.cuerpo, 10)
        .then((respuesta) => {
          if (respuesta.apropiado < rechazaPost) {
            // TODO Feature: ¿Devolver razón? Si se decidió que no, está bien.
            res.status(400).send("Texto rechazo por moderación automática");
            return;
          }
  
          // TODO Refactor: Quizá sea más facil usar yield para esta parte, o ir devolviendo las premisas. O ambas cosas.
          Pregunta.findByPk(req.body.IDPregunta, {
            include: Post,
          }).then((pregunta) => {
            if (!pregunta) {
              res.status(404).send("Pregunta no encontrada / disponible");
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
                      if (respuesta.apropiado < reportaPost) {
                        ReportePost.create({
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
  
                      //si adentro de send hay un int tira error porque piensa que es el status
                      res.status(201).send(post.ID + "");
                    })
                    .catch((err) => {
                      res.status(500).send(err);
                    });
                })
                .catch((err) => {
                  res.status(500).send(err);
                });
            }
          });
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    } else {
      Pregunta.findByPk(req.body.IDPregunta, {
        include: Post,
      }).then((pregunta) => {
        if (!pregunta) {
          res.status(404).send("Pregunta no encontrada / disponible");
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
  
                  //si adentro de send hay un int tira error porque piensa que es el status
                  res.status(201).send(post.ID + "");
                })
                .catch((err) => {
                  res.status(500).send(err);
                });
            })
            .catch((err) => {
              res.status(500).send(err);
            });
        }
      });
    }
  });
  
  router.patch("/", function (req, res) {
    if (!req.session.usuario) {
      res.status(401).send("Usuario no tiene sesión válida activa.");
    }
    Respuesta.findByPk(req.body.ID, {
      include: Post,
    })
      .then((respuesta) => {
        if (!respuesta) {
          res.status(404).send("Respuesta no encontrada");
          return;
        } else {
          if (respuesta.post.duenioDNI != req.session.usuario.DNI) {
            res.status(403).send("No puede editar una respuesta ajena.");
            return;
          } else {
            //filtro IA
            // TODO Refactor: DRY
            let modera= getModera();
            let reportaPost = getReportaPost();
            if (modera==1) {
              moderarWithRetry(req.body.cuerpo, 10).then((resp) => {
                let rechazaPost = getRechazaPost();
                if (resp.apropiado < rechazaPost) {
                  res.status(400).send("Texto rechazo por moderación automática");
                  return;
                } else if (resp.apropiado < reportaPost) {
                  //Crear reporte
                  //TODO Feature: definir tipo y definir si ponemos como reportanteID algo que represente al sistema o se encarga el front
                  ReportePost.create({
                    reportadoID: respuesta.ID,
                  });
                }
                //pasa el filtro
                respuesta.cuerpo = req.body.cuerpo;
                respuesta.save();
                res.status(200).send("Respuesta actualizada exitosamente");
              });
            } else {
              respuesta.cuerpo = req.body.cuerpo;
              respuesta.save();
              res.status(200).send("Respuesta actualizada exitosamente");
            }
          }
        }
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });

  

export { router };