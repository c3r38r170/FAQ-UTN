import * as express from "express";
import { Sequelize } from "sequelize";
import { moderarWithRetry } from "./ia.js";
import {
    Usuario,
    ReportePost,
    Pregunta,
    SuscripcionesPregunta,
    Post,
    Respuesta,
    SuscripcionesEtiqueta,
    Notificacion,
    EtiquetasPregunta,
  } from "./model.js";

const router = express.Router();

import { getModera, getRechazaPost, getReportaPost } from "./parametros.js";






router.get("/", (req, res) => {
    // TODO Refactor: Mandar este comentario a Pregunta.pagina
    // ! Siempre pedir el Post, por más que no se consulten los datos.
  
    // TODO Feature: Aceptar etiquetas.
  
    let parametros = { pagina: req.query.pagina || 0, filtrar: {}, formatoCorto: req.query.formatoCorto!==undefined };
  
    // TODO Refactor: DRY
    if (req.query.searchInput) {
      parametros.filtrar.texto = req.query.searchInput;
    }
    
    if(req.query.etiquetas){
      parametros.filtrar.etiquetas=Array.isArray(req.query.etiquetas)?req.query.etiquetas:[req.query.etiquetas];
    }
  
    // console.log(filtros);
    Pregunta.pagina(parametros)
      .then((preguntas) => {
          res.status(200).send(preguntas);
      })
      .catch((err) => {
        res.status(500).send(err.message);
      });
  });
  
  router.patch("/", function (req, res) {
    // console.log(req.body);
    Pregunta.findByPk(req.body.ID, {
      include: [
        Post
        , {
          model: EtiquetasPregunta,
          as:'etiquetas',
        }
      ],
    })
      .then((pregunta) => {
        if (!pregunta) {
          res.status(404).send("Pregunta no encontrada");
          return;
        } else {
          if (pregunta.post.duenioDNI != req.session.usuario.DNI) {
            res.status(403).send("No puede editar una pregunta ajena.");
            return;
          } else {
            // TODO Refactor: DRY en este if
            let modera = getModera();
            if (modera) {
              moderarWithRetry(req.body.titulo + " " + req.body.cuerpo, 50).then(
                (respuesta) => {
                  let esperarA = []
                  let rechazaPost = getRechazaPost();
                  let reportaPost = getReportaPost();
                  if (respuesta.apropiado < rechazaPost) {
                    res
                      .status(400)
                      .send("Texto rechazo por moderación automática");
                    return;
                  } else if (respuesta.apropiado < reportaPost) {
                    //Crear reporte
                    //TODO Feature: definir tipo y definir si ponemos como reportanteID algo que represente al sistema o se encarga el front (Santiago: Yo digo dejarlo NULL y que se encargue el frontend.)
                    esperarA.push(ReportePost.create({
                      reportadoID: pregunta.ID,
                    }))
    
                  }
                  //si pasa el filtro
                  pregunta.post.cuerpo = req.body.cuerpo;
                  pregunta.titulo = req.body.titulo;
                  // !no se porque pero asi anda pregunta.save() no
                  esperarA.push(
                    pregunta.post.save()
                    .then( () =>
                      pregunta.setEtiquetas([])
                    )
                    .then( pre => pre.save())
                    .then( () =>
                      Promise.all(req.body.etiquetas.map(
                        (ID) =>  EtiquetasPregunta.create({ etiquetumID: ID , preguntumID: pregunta.post.ID})
                      ))
                    )
                    // .then(ep => pregunta.setEtiquetas(req.body.etiquetas.map(
                    //   (ID) =>({ preguntumID : pregunta.post.ID , etiquetumID: ID })
                    // )))
                  )
                  Promise.all(esperarA)
                  .then( () =>
                    res.status(200).send("Pregunta actualizada exitosamente")
                  )
               
                }
              );
            } else {
              let esperarA = []
              pregunta.post.cuerpo = req.body.cuerpo;
              pregunta.titulo = req.body.titulo;
  
  
              const etiquetas = Array.isArray(req.body.etiquetas) ? req.body.etiquetas : [req.body.etiquetas]; 
               // !no se porque pero asi anda pregunta.save() no
               esperarA.push(
                pregunta.post.save()
                .then( () =>
                  pregunta.setEtiquetas([])
                )
                .then( pre => pre.save())
                .then( () =>
                  Promise.all(etiquetas.map(
                    (ID) =>  EtiquetasPregunta.create({ etiquetumID: ID , preguntumID: pregunta.post.ID})
                  ))
                )
                // .then(ep => pregunta.setEtiquetas(req.body.etiquetas.map(
                //   (ID) =>({ preguntumID : pregunta.post.ID , etiquetumID: ID })
                // )))
              )
              Promise.all(esperarA)
              .then( () =>
                res.status(200).send(req.body.ID+"")
              )
              //etiquetas vienen los id en array
              // pregunta.setEtiquetas(
              //   req.body.etiquetasIDs.map(
              //     (ID) => new EtiquetasPregunta({ etiquetumID: ID })
              //   )
              // );
              //no se porque pero asi anda pregunta.save() no
              // pregunta.post.save();
              // res.status(200).send("Pregunta actualizada exitosamente");
            }
          }
        }
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });
  
  function crearPregunta(req,res,respuestaIA=null){
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
      if (respuestaIA && respuestaIA < reportaPost) {
        // TODO Feature testeado atado con alambre anda, habria que buscar un mensaje que caiga en esta
        esperarA.push(
          ReportePost.create({
            reportadoID: pregunta.ID,
          })
        );
      }
      //si es una tira error
      const etiquetasIDs = Array.isArray(req.body.etiquetasIDs) ? req.body.etiquetasIDs : [req.body.etiquetasIDs]; 
      esperarA.push(
        //etiquetas
          
     etiquetasIDs.forEach(id=>{
              EtiquetasPregunta.create({
                preguntumID:pregunta.ID,
                etiquetumID:id
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
        ,SuscripcionesEtiqueta.findAll({
          attributes: ['suscriptoDNI'],
          where: {
            etiquetaID: {
              [Sequelize.Op.in]: etiquetasIDs
            },
            fecha_baja: null
          },
          distinct: true
        }).then(suscripciones=>{
          return Promise.all(suscripciones.map(suscripcion =>Notificacion.create({
            postNotificadoID:pregunta.ID,
            notificadoDNI:suscripcion.suscriptoDNI
          })));
        })
  
        //Suscribe a su propia pregunta
        ,Usuario.findByPk(req.session.usuario.DNI)
          .then(usu=>pregunta.addUsuariosSuscriptos(usu))
      )
      
      Promise.all(esperarA)
        .then(()=>pregunta.save())
        .then(() => {
          // ! Sin las comillas se piensa que pusimos el status dentro del send
          res.status(201).send(pregunta.ID+"");
        })
    })
    .catch(err=>{
      res.status(500).send(err);
    })
  }
  
  router.post("/", function (req, res) {
    let modera=getModera();
    if (modera) {
      moderarWithRetry(req.body.titulo + " " + req.body.cuerpo, 10)
        .then((respuesta) => {
          let rechazaPost = getRechazaPost();
          if (respuesta.apropiado < rechazaPost) {
            //esto anda
            // TODO UX: ¿Mandar respuesta del bot?
            res.status(400).send("Texto rechazo por moderación automática");
            return;
          }
          //reporte en esta funcion
          crearPregunta(req,res,respuesta.apropiado)
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    } else crearPregunta(req,res)
  })
  
  router.put('/:ID',function(req,res){
    let usuarioActual=req.session.usuario;
    if (usuarioActual.perfil.permiso.ID < 2) {
      res
        .status(403)
        .send("No se poseen permisos de moderación");
      return;
    }
  
    Pregunta.findByPk(req.params.ID,{
      include:[
        {model:Post,include:{model:Usuario,as:'eliminador'}},
        {model:Respuesta,as:'respuestas',include:Post},
      ]
    })
      .then(pre=>{
        if(!pre){
          // TODO Refactor: DRY en todos los "no se posee sesion", "no se poseen permisos", etc.
          res.status(404).send("Pregunta no encontrada");
          return;
        }
  
        // TODO Refactor: Ver si es posible simplificar
        let esperarA=[], preguntaReemplazoID=req.body.duplicadaID;
  
        if(pre.respuestas.length){
          esperarA.push(...pre.respuestas.map(resp=>resp.setPregunta(preguntaReemplazoID).then(r=>r.save())));
        }
  
        esperarA.push(pre.post.setEliminador(usuarioActual.DNI).then(p=>p.save()));
  
        Promise.all(esperarA).then(()=>{
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
                res.status(201).send("Suscripción creada");
                return;
              } else {
                res.status(401).send("Ya se encuentra suscripto a la pregunta");
              }
            })
            .catch((err) => {
              res.status(500).send(err);
            });
        }
      })
      .catch((err) => {
        res.status(500).send(err);
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
                sus.save().then(()=>res.status(201).send("Suscripción cancelada"));
              }
            })
            .catch((err) => {
              res.status(500).send(err);
            });
        }
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });
  
  

export { router };