import * as express from "express";
import * as bcrypt from "bcrypt";
import multer from "multer";
import path from "path"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './storage/img')
  },
  filename: function (req, file, cb) {
    cb(null, "imagenPerfil-" + req.session.usuario.DNI+".jpg")
  },
  
})
var upload = multer({storage:storage,
  fileFilter: function(req, file, cb){
    const allowedExtensions = ['.jpg', '.png']; // Add more extensions as needed
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true); // Accept the file
    } else {
        cb(null, false); // Reject the file
    }
  }})
const router = express.Router();
import {
  Usuario,
  Perfil,
  Permiso,
  Voto,
  ReportePost,
  Pregunta,
  SuscripcionesPregunta,
  ReportesUsuario,
  Post,
  Respuesta,
  Etiqueta,
  SuscripcionesEtiqueta,
  Notificacion,
  EtiquetasPregunta,
  Categoria,
  Carrera,
  Bloqueo,
  Parametro,
  TipoReporte,
} from "./model.js";
import { Sequelize } from "sequelize";
import { moderar, moderarWithRetry } from "./ia.js";

// TODO Refactor: ¿Sacar y poner en models.js? Así el modelo se encarga de la paginación, y a los controladores no les importa.
let PAGINACION = {
  resultadosPorPagina: 10,
};

let rechazaPost = 40;
let reportaPost = 70;
let modera = false;

Parametro.findAll().then((ps) => {
  ps.forEach((p) => {
    if (p.ID == 1) PAGINACION.resultadosPorPagina = parseInt(p.valor);
    if (p.ID == 2) modera = p.valor == "1";
    if (p.ID == 3) rechazaPost = parseInt(p.valor);
    if (p.ID == 4) reportaPost = parseInt(p.valor);
  });
});

// TODO Refactor: Separar este archivo de más de 2k líneas de código en diferentes archivos segpun la entidad accedida. Ejemplo: https://github.com/c3r38r170/tp-fullstack/blob/master/backend/rutas/todas.js

// sesiones

router.post("/sesion", function (req, res) {
  let usuario;
  Usuario.findByPk(req.body.DNI, {
    include: {
      model: Perfil,
      include: Permiso,
    },
  })
    .then((usu) => {
      if (!usu) {
        res.status(404).send("El DNI no se encuentra registrado.");
        return;
      } else {
        usuario = usu;
        return bcrypt.compare(req.body.contrasenia, usu.contrasenia);
      }
    })
    .then((coinciden) => {
      if (coinciden) {
        req.session.usuario = usuario;
        res.status(200).send();
        return;
      } else if (coinciden == false) {
        //si salió por el 404 coinciden queda undefined
        res.status(401).send("Contraseña incorrecta.");
        return;
      }
    })
    .catch((err) => {
      res.status(500).send(err);
      return;
    });
});
router.delete("/sesion", function (req, res) {
  req.session.destroy();
  res.status(200).send();
});

// usuario

router.get("/usuario/:DNI/foto", function(req, res){
  res.sendFile("imagenPerfil-"+req.params.DNI+".jpg", {'root': './storage/img'}, (err)=>{
    if (err) {
      res.sendFile("user.webp", {'root': './storage/img'})
    }
  });
});

router.get("/usuario", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("No se posee sesión válida activa");
    return;
  } else if (req.session.usuario.perfil.permiso.ID < 2) {
    res
      .status(403)
      .send("No se poseen permisos de moderación o sesión válida activa");
    return;
  }

  // TODO Feature: Considerar siempre los bloqueos, y el perfil. Recoger ejemplos (y quizás, normalizarlos) de estas inclusiones

  let opciones = {
    subQuery: false,
    limit: PAGINACION.resultadosPorPagina,
    offset: (+req.query.pagina || 0) * PAGINACION.resultadosPorPagina,
    attributes: [
      "nombre",
      "DNI",
      "correo",
      "fecha_alta" /* ,'perfilID' Si se quiere el perfil, traer todo, no solo la ID... */,
    ],
  };

  let include = [
      {
        model: Perfil,
      },
    ],
    where = {},
    order = [];

  if (+req.query.reportados) {
    include.push(
      {
        model: Bloqueo,
        as: "bloqueosRecibidos",
        // TODO Feature: Traer quién bloqueó y razón.
        attributes: ["motivo"],
        where: {
          fecha_desbloqueo: { [Sequelize.Op.is]: null },
        },
        required: false,
      },
      {
        model: ReportesUsuario,
        as: "reportesRecibidos",
        attributes: ["fecha"],
        required: true,
      }
    );
    order.push([Sequelize.col("reportesRecibidos.fecha"), "DESC"]);
  }else{
    include.push(
      {
        model: Bloqueo,
        as: "bloqueosRecibidos",
        // TODO Feature: Traer quién bloqueó y razón.
        attributes: ["motivo"],
        where: {
          fecha_desbloqueo: { [Sequelize.Op.is]: null },
        },
        required: false,
      },
      {
        model: ReportesUsuario,
        as: "reportesRecibidos",
        attributes: ["fecha"],
        required: false,
      }
    );
    order.push([Sequelize.col("reportesRecibidos.fecha"), "DESC"]);
  }
  let filtro = req.query.filtro;
  if (filtro) {
    where.DNI = { [Sequelize.Op.substring]: filtro };
    where.nombre = { [Sequelize.Op.substring]: filtro };
    include.push(Carrera);
    where["$carrera.legajo$"] = { [Sequelize.Op.substring]: filtro };
  }else if( req.query.searchInput){
    
    where = {
      [Sequelize.Op.or]: [
        { DNI: { [Sequelize.Op.substring]: req.query.searchInput } },
        { nombre: { [Sequelize.Op.substring]: req.query.searchInput } },
        { '$perfil.nombre$': { [Sequelize.Op.startsWith]: req.query.searchInput } }
      ]
    };
    opciones.where = where;
  }

  if (include.length) {
    opciones.include = include;
  }
  if (Object.keys(where).length) {
    opciones.where = where;
  }
  opciones.order = [...order, ["DNI", "ASC"]];

  Usuario.findAndCountAll(opciones)
    .then((usuarios) => {
      if (usuarios.length == 0 && filtro) {
        res.status(404).send("No se encontraron usuarios");
      } else {
        res.setHeader('untfaq-cantidad-paginas', Math.ceil(usuarios.count/PAGINACION.resultadosPorPagina));
      res.status(200).send(usuarios.rows);
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.get("/usuario/:DNI/preguntas", function(req, res){
	let filtros={pagina:null,duenioID:null};
		filtros.duenioID=req.params.DNI
		filtros.pagina=req.query.pagina
		Pregunta.pagina(filtros)
		// Pregunta.findAll(opciones)
			.then(preguntas=>{
				res.status(200).send(preguntas)
			})
			.catch(err=>{
				res.status(500).send(err)
			});
	// }
	return;
})

router.get("/usuario/:DNI/preguntas", function (req, res) {
  Pregunta.pagina({
    pagina: req.query.pagina
    , duenioID: req.params.DNI
  })
    .then((preguntas) => {
      res.status(200).send(preguntas);
    })
    .catch((err) => {
      res.status(500).send(err)
    });
});

router.get("/usuario/:DNI/posts", function (req, res) {
  Post.pagina({ pagina: req.query.pagina||null, DNI: req.params.DNI }).then((posts) => res.send(posts));
});

router.get("/usuario/:DNI/respuestas", function (req, res) {
  let filtros = { pagina: null, DNI: req.params.DNI };
  let pagina = 0;
  if (req.query.pagina) {
    filtros.pagina = req.query.pagina;
    pagina = req.query.pagina;
  }

  Respuesta.pagina(filtros).then((posts) =>
    res.send(posts)
  );
});

router.post("/usuario", (req, res) => {
  let perfilID = req.body.perfilID ? req.body.perfilID : 1;
  Usuario.findAll({
    where: { DNI: req.body.DNI },
    raw: true,
    nest: true,
    plain: true,
  })
    .then((usu) => {
      if (!usu) {
        Usuario.create({
          nombre: req.body.nombre,
          DNI: req.body.DNI,
          correo: req.body.correo,
          contrasenia: req.body.contrasenia,
          perfilID: perfilID
        }).then(usu=>Usuario.findByPk(usu.DNI,{
            include:{
              model: Perfil,
              include:Permiso
            }
        })).then(usuarioConPerfilYPermisos=>{
          if(!req.session.usuario)
            req.session.usuario=usuarioConPerfilYPermisos;
          res.status(200).send("Registro exitoso");
        });
        return;
      }
      res.status(400).send("El Usuario ya se encuentra registrado");
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

//Te deja reinciar la contra de cualquiera lol
router.post("/usuario/:DNI/contrasenia", function (req, res) {
  function generarContrasenia() {
    var length = 8,
      charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  Usuario.findByPk(req.params.DNI).then((usu) => {
    if (!usu) {
      res.status(404).send("DNI inexistente");
      return;
    }
    let contraseniaNueva = generarContrasenia();
    usu.contrasenia = contraseniaNueva;

    //TODO Feature: mandar mail
    usu.save().then(res.status(200).send("DNI encontrado, correo enviado"));
  });
});

router.post("/usuario/:DNI/reporte", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  Usuario.findByPk(req.params.DNI)
    .then((usuario) => {
      if (!usuario) {
        res.status(404).send("Usuario no encontrado");
        return;
      } else {
        // TODO Refactor: Usar Sequelize, usuario.addReporteUsuario(new ReporteUsuario({reportante: ... o como sea }))
        ReportesUsuario.create({
          usuarioReportanteDNI: req.session.usuario.DNI,
          usuarioReportadoDNI: req.params.DNI,
        });

        res.status(201).send("Reporte registrado");
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.post("/usuario/:DNI/bloqueo", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 2) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  // TODO Security: Chequear permisos
  // TODO Feature: Comprobar que exista req.body.motivo

  Usuario.findByPk(req.params.DNI, {
    include: [
      {
        model: Bloqueo,
        as: "bloqueosRecibidos",
        where: { fecha_desbloqueo: { [Sequelize.Op.is]: null } },
        required: false,
      },
    ],
  })
    .then((usuario) => {
      if (!usuario) {
        res.status(404).send("Usuario no encontrado");
        return;
      }

      // TODO Refactor: Ver si viene igual el array o no.
      let mensaje = "Usuario bloqueado.";
      if (!usuario.bloqueosRecibidos?.length) {
        let bloqueo = new Bloqueo({
          motivo: req.body.motivo,
        });
        bloqueo.save().then(() => {
          Promise.all([
            Usuario.findByPk(req.session.usuario.DNI)
              .then((usuarioActual) =>
                usuarioActual.addBloqueosRealizados(bloqueo)
              )
              .then((usuarioActual) => usuarioActual.save()),
            usuario.addBloqueosRecibidos(bloqueo).then(() => usuario.save()),
          ]).then(() => {
            res.status(201).send(mensaje);
          });
        });
      } else res.status(200).send(mensaje);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.delete("/usuario/:DNI/bloqueo", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 2) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  // TODO Feature: Comprobar que exista req.body.motivo

  Usuario.findByPk(req.params.DNI, {
    include: [
      {
        model: Bloqueo,
        as: "bloqueosRecibidos",
        where: { fecha_desbloqueo: { [Sequelize.Op.is]: null } },
        required: false,
      },
    ],
  }).then((usuario) => {
    if (!usuario) {
      res.status(404).send("Usuario no encontrado");
      return;
    }

    // TODO Refactor: Ver si viene igual el array o no.
    let mensaje = "Usuario desbloqueado.";
    if (usuario.bloqueosRecibidos?.length) {
      let bloqueo = usuario.bloqueosRecibidos[0];
      bloqueo.motivo_desbloqueo = req.body.motivo;
      bloqueo.fecha_desbloqueo = new Date();
      bloqueo
        .save()
        .then(() => Usuario.findByPk(req.session.usuario.DNI))
        .then((usuarioActual) =>
          usuarioActual.addDesbloqueosRealizados(bloqueo)
        )
        .then((usuarioActual) => usuarioActual.save())
        .then(() => {
          res.status(201).send(mensaje);
        });
    }
  });
});

router.patch("/usuario", upload.single("image"), function (req, res) {
  //req.file tiene la imagen
  //TODO feature que se pueda cambiar contraseña o imagen
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }

  if(!req.file){
    //req.file solo existe si la imagen cumple con los formatos de arriba
    //TODO esto no funcionaría si solo manda la contraseña
    res.status(400).send("Petición mal formada")
  }
  Usuario.findByPk(req.session.usuario.DNI)
    .then((usuario) => {
      if(!bcrypt.compare(req.body.contraseniaAnterior, usuario.contrasenia)){
        res.status(401).send("Contraseña anterior no válida")
        return;
      }

      usuario.contrasenia = req.body.contraseniaNueva;
      usuario.save();
      res.status(200).send("Datos actualizados exitosamente");
      })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.patch("/usuario/:DNI", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  Usuario.findByPk(req.params.DNI)
    .then((usuario) => {
      //TODO Feature: definir que mas puede cambiar y que constituye datos inválidos
      usuario.nombre = req.body.nombre;
      usuario.correo = req.body.correo;
      usuario.perfilID= req.body.perfilID;
      usuario.save();
      res.status(200).send("Datos actualizados exitosamente");
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});



// posts
//preguntas

// TODO Refactor: Ver si consultas GET aceptan body, o hay que poner las cosas en la URL (chequear proyecto de TTADS)
router.get("/pregunta", (req, res) => {
  // TODO Refactor: Mandar este comentario a Pregunta.pagina
  // ! Siempre pedir el Post, por más que no se consulten los datos.

  // TODO Feature: Aceptar etiquetas.

  let filtros = { pagina: req.query.pagina || 0, filtrar: {}, formatoCorto: req.query.formatoCorto!==undefined };

  if (req.query.searchInput) {
    filtros.filtrar.texto = req.query.searchInput;
  }
  if(req.query.etiquetaID){
    filtros.filtrar.etiquetaID=req.query.etiquetaID;
    filtros.filtrar.etiquetas=true;
  }

  Pregunta.pagina(filtros)
    .then((preguntas) => {
      res.status(200).send(preguntas);
    })
    .catch((err) => {
      res.status(500).send(err)
    });
});

router.patch("/pregunta", function (req, res) {
  // console.log(req.body);
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa.");
  }
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
          if (modera) {
            moderarWithRetry(req.body.titulo + " " + req.body.cuerpo, 50).then(
              (respuesta) => {
                let esperarA = []
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
              res.status(200).send("Pregunta actualizada exitosamente")
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

router.post("/pregunta", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }

  if (modera) {
    moderarWithRetry(req.body.titulo + " " + req.body.cuerpo, 10)
      .then((respuesta) => {
        if (respuesta.apropiado < rechazaPost) {
          //esto anda
          // TODO UX: ¿Mandar respuesta del bot?
          res.status(400).send("Texto rechazo por moderación automática");
          return;
        }

        crearPregunta(req,res,respuesta.apropiado)
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  } else crearPregunta(req,res)
})

router.put('/pregunta/:ID',function(req,res){
  let usuarioActual=req.session.usuario;
  if (!usuarioActual) {
    res
      .status(401)
      .send("No se posee sesión válida activa");
    return;
  } else if (usuarioActual.perfil.permiso.ID < 2) {
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

router.post("/pregunta/:preguntaID/suscripcion", function (req, res) {
  //TODO Feature: acomodar el filtro para que no encuentre suscripciones dadas de baja
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }

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

// TODO Refactor: "suscripcion"? Todos los demás endpoints están en singular.
router.get('/suscripciones', function(req,res){
	//TODO Feature: acomodar el filtro para que no encuentre suscripciones dadas de baja. fecha_baja, ver si conviene volver a las relaciones como antes...
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	// TODO Feature Poner en Pregunta.pagina para tener también las suscripciones (aca hace falta?? sabemos que todas estas lo incluyen, quizá poner en el frontend. Esto haría un parámetro de si hacen falta los votos o no)
	// TODO Feature Usar Pregunta.pagina para tener todos los datos unificados, como los votos
  // TODO Feature faltan la cantidad de respuestas

	const pagina = req.query.pagina || 0;
	Pregunta.findAll({
		include:[
			{
				model: Post,
				as: 'post',
				include: [
					{
						model: Usuario,
						as: 'duenio',
            include:{model:Perfil}
					}
				]
			},
			{
				model: EtiquetasPregunta,
				as:'etiquetas',
				include: {
          model: Etiqueta,
          include: {
            model: Categoria,
            as: "categoria",
          },
        }
			},
			{
				model:Usuario
				,where:{
					DNI:req.session.usuario.DNI
				}
				,as: 'usuariosSuscriptos',
				through: {
					model: SuscripcionesPregunta,
					where: {
						fecha_baja: null // * Condición para que la fecha de baja sea nula
					}
				}
			}
		],
		subQuery:false,
		order:[[Post,'fecha','DESC']],
		limit:PAGINACION.resultadosPorPagina,
		offset:(+pagina)*PAGINACION.resultadosPorPagina,
	})
		.then((suscripciones)=>{
      res.status(200).send(suscripciones);
		})
		.catch(err=>{
      res.status(500).send(err);
    })  
})

router.delete("/pregunta/:preguntaID/suscripcion", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }

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

//respuesta

router.post("/respuesta", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  // TODO Refactor: Unificar if y else. Ver cuál es la versión más reciente de cada parte.
  if (modera) {
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

router.patch("/respuesta", function (req, res) {
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
          if (modera) {
            moderarWithRetry(req.body.cuerpo, 10).then((resp) => {
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


router.get('/post/reporte',function(req, res){
	let pagina=req.query.pagina||0;
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

router.post("/post/:votadoID/valoracion", valorarPost);

router.delete("/post/:votadoID/valoracion", eliminarVoto);

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
          tipo: req.body.tipo,
          reportante: req.session.usuario.DNI,
          reportado: reportadoID,
        }).then((r) => r.save());
        res.status(201).send("Reporte registrado");
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};

router.post("/post/:reportadoID/reporte", reportarPost);

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

router.delete('/post/:ID',(req,res) => {
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

//categorias

// TODO Refactor: Los endpoint son en singular.
router.get("/categorias", async (req, res) => {
  try {
    let categorias;
    // TODO Refactor: raw? nest?
    if(!!+req.query.etiquetas){
      categorias=await Categoria.findAll({include:{model:Etiqueta, as:'etiquetas'}})
    }else{
      categorias = await Categoria.findAll();
    }
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/categoria/:id/activado", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (categoria) {
      categoria.activado = !categoria.activado;
      await categoria.save();
      res.json(categoria);
    } else {
      res.status(404).json({ error: "Categoria no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para crear una nueva categoría
router.post("/categorias", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const { descripcion, color } = req.body;
  try {
    const categoria = await Categoria.create({ descripcion, color });
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ruta para actualizar una categoría por su ID
router.patch("/categorias/:id", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const id = req.params.id;
  const { descripcion, color } = req.body;
  try {
    let categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    categoria = await categoria.update({ descripcion, color });
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ruta para eliminar una categoría por su ID
router.delete("/categorias/:id", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const id = req.params.id;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    await categoria.destroy();
    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// etiquetas

router.post("/etiqueta", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  const { descripcion, categoriaID } = req.body;
  Etiqueta.create({ descripcion, categoriaID }).then(() => {
    res.status(200).send();
  });
});

// TODO Refactor: cambiar este endpoint a categoría. Hacer que categoría acepte un parámetro de con o sin etiquetas.
router.get("/etiqueta", function (req, res) {
  //* sin paginación porque no deberían ser tantas

  // TODO Refactor: Ver si el estandar de REST permite enviar colecciones separadas en casos como este, donde la redundancia es aproximadamente el 50% de la carga. O si hay que hacer endpoint de categorias...
  // TODO Refactor: Quizá directamente pedir categorias ¯\_(ツ)_/¯
  /* Promise.all(
		Etiqueta.findAll({
			raw:true,
			nest:true
		})
		,Categoria.findAll({
			raw:true,
			nest:true
		})
	)
	.then((etiquetas,categorias)=>{
		res.status(200).send({etiquetas,categorias}); */
  let pagina = req.query.pagina ? req.query.pagina : 0;
  Etiqueta.findAndCountAll({
    raw: true,
    nest: true,
    include: [{ model: Categoria, as: "categoria" }],
    limit: PAGINACION.resultadosPorPagina,
		offset: (+pagina) * PAGINACION.resultadosPorPagina,
  })
    .then((etiquetas) => {
      res.setHeader('untfaq-cantidad-paginas', Math.ceil(etiquetas.count/PAGINACION.resultadosPorPagina));
      res.status(200).send(etiquetas.rows);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// TODO Refactor: Cambiar endpoint a etiqueta, los nombres son en singular.
// TODO Refactor: Cambiar todas las funciones async a sincrónicas. Usar then en los cuerpos, y funciones de Premises, en todo caso.
router.patch("/etiquetas/:id/activado", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const { id } = req.params;
  try {
    const etiqueta = await Etiqueta.findByPk(id);
    if (etiqueta) {
      etiqueta.activado = !etiqueta.activado;
      await etiqueta.save();
      res.json(etiqueta);
    } else {
      res.status(404).json({ error: "Etiqueta no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/etiquetas/:id", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const id = req.params.id;
  const { descripcion, categoriaID } = req.body;
  try {
    let etiqueta = await Etiqueta.findByPk(id, {
      include: [{ model: Categoria, as: "categoria" }],
    });
    if (!etiqueta) {
      return res.status(404).json({ message: "Etiqueta no encontrada" });
    }
    etiqueta = await etiqueta.update({ descripcion, categoriaID });
    etiqueta = await Etiqueta.findByPk(id, {
      include: [{ model: Categoria, as: "categoria" }],
    }).then((etiqueta) => {
      res.json(etiqueta);
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/etiqueta/:etiquetaID/suscripcion", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }

  let IDetiqueta = req.params.etiquetaID;

  Etiqueta.findByPk(IDetiqueta)
    .then((etiqueta) => {
      if (!etiqueta) {
        res.status(404).send("Etiqueta no encontrada / disponible");
        return;
      } else {
        SuscripcionesEtiqueta.findAll({
          where: {
            etiquetaID: IDetiqueta,
            suscriptoDNI: req.session.usuario.DNI,
            fecha_baja: {
              [Sequelize.Op.is]: null,
            },
          },
          plain: true,
        })
          .then((sus) => {
            if (!sus) {
              SuscripcionesEtiqueta.create({
                suscriptoDNI: req.session.usuario.DNI,
                etiquetaID: IDetiqueta,
              }).then((s) => s.save());
              res.status(201).send("Suscripción creada");
              return;
            } else {
              res.status(401).send("Ya se encuentra suscripto a la etiqueta.");
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

router.delete("/etiqueta/:etiquetaID/suscripcion", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }

  let IDetiqueta = req.params.etiquetaID;

  Etiqueta.findByPk(IDetiqueta)
    .then((etiqueta) => {
      if (!etiqueta) {
        res.status(404).send("Etiqueta no encontrada / disponible");
        return;
      } else {
        SuscripcionesEtiqueta.findAll({
          where: {
            etiquetaID: IDetiqueta,
            suscriptoDNI: req.session.usuario.DNI,
            fecha_baja: {
              [Sequelize.Op.is]: null,
            },
          },
          plain: true,
        })
          .then((sus) => {
            if (!sus) {
              res.status(401).send("No se encuentra suscripto a la etiqueta");
              return;
            } else {
              sus.fecha_baja = new Date().toISOString().split("T")[0];
              sus.save();
              res.status(201).send("Suscripción cancelada");
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

//notificaciones

// TODO Refactor: Minimizar datos que envia este endpoint.
// TODO Feature: Hacer que se devuelvan una sola notificacion por pregunta (sí, pregunta)
router.get('/notificacion', function(req,res){
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
	if(!req.session.usuario){
		res.status(403).send("No se posee sesión válida activa");
		return;
	}

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
				required:true,
				include: [
					{ model: Usuario, as: 'duenio', attributes: [/* 'DNI', 'nombre' */] }, 
					{
						model: Respuesta
						, as: 'respuesta'
						, include: [
							{ model: Pregunta, as: 'pregunta', attributes: [/* 'ID', 'titulo' */] } // *Include Pregunta in Respuesta
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
		attributes:[
			[Sequelize.fn('min',Sequelize.col('notificacion.visto')),'visto']
			,[Sequelize.fn('max',Sequelize.col('notificacion.createdAt')),'createdAt']
			,[Sequelize.fn('count',Sequelize.col('*')),'cantidad']
			,[Sequelize.literal(`IF(post.duenioDNI='${req.session.usuario.DNI}',1,0)`),'propia']
			,[Sequelize.fn('coalesce',Sequelize.col('post.respuesta.pregunta.titulo'),Sequelize.col('post.pregunta.titulo')),'titulo']
			
			,[Sequelize.col('post.respuesta.preguntaID'),'respuestaPreguntaID']
			,[Sequelize.col('post.pregunta.ID'),'preguntaID']
		],
		group:[
			'propia'
			,'post.respuesta.preguntaID'
			,'post.pregunta.ID'
		],
		raw: true,
		nest: true
	}).then(notificaciones=>{
		res.status(200).send(notificaciones);
	}).catch(err=>{
		res.status(500).send(err);
	});
});

router.patch("/notificacion", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send();
    return;
  }

  let notificacionID = req.body.ID;

  if (!notificacionID) {
    res.status(400).send();
    return;
  }

  Notificacion.findByPk(notificacionID)
    .then((notificacion) => {
      if (!notificacion) {
        res.status(404).send();
        return;
      }

      if (notificacion.notificadoDNI != req.session.usuario.DNI) {
        res.status(403).send();
        return;
      }

      notificacion.visto = true;
      return notificacion.save();
    })
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// TODO Feature
/* router.get('/',(req,res)=>{
	// retornar estado de la api, disponible o no
}) */

//EntradasPorPagina	ModerarIA	RechazaPost	ReportaPost

router.get("/parametros", function (req, res) {
  Parametro.findAll().then((parametros) => {
    res.send(parametros);
  });
});

router.patch("/parametros/:ID", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  if (!req.session.usuario) {
    res
      .status(403)
      .send("No se poseen permisos de administración o sesión válida activa");
    return;
  } else if (req.session.usuario.perfil.permiso.ID < 3) {
    res
      .status(403)
      .send("No se poseen permisos de administración o sesión válida activa");
    return;
  }
  Parametro.findByPk(req.params.ID).then((p) => {
    p.valor = req.body.valor;
    p.save();
    res.status(200).send(p);
    if (req.params.ID == 1)
      PAGINACION.resultadosPorPagina = parseInt(req.body.valor);
    if (req.params.ID == 2) modera = req.body.valor == "1";
    if (req.params.ID == 3) rechazaPost = parseInt(req.body.valor);
    if (req.params.ID == 4) reportaPost = parseInt(req.body.valor);
  });
});

router.get("/perfiles", async (req, res) => {
  try {
    if(req.query.todos){
      const perfiles = await Perfil.findAll({
        include: Permiso,
      });
      res.status(200).send(perfiles);
      return;
    }
    let pagina = req.query.pagina ? req.query.pagina : 0;
    const perfiles = await Perfil.findAndCountAll({
      include: Permiso,
      limit: PAGINACION.resultadosPorPagina,
      offset:
        (+pagina * PAGINACION.resultadosPorPagina)
    });
    res.setHeader('untfaq-cantidad-paginas', Math.ceil(perfiles.count/parseInt(PAGINACION.resultadosPorPagina)));
    res.status(200).send(perfiles.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para crear un nuevo perfil
router.post("/perfiles", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const { nombre, color, permisoID } = req.body;
  try {
    const nuevoPerfil = await Perfil.create({
      nombre: nombre,
      color: color,
      permisoID: permisoID,
    });
    res.status(201).json(nuevoPerfil);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para actualizar un perfil por su ID
router.patch("/perfiles/:id", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const { id } = req.params;
  const { nombre, color, permisoID } = req.body;
  try {
    const perfil = await Perfil.findByPk(id);
    if (perfil) {
      perfil.nombre = nombre;
      perfil.color = color;
      perfil.permisoID = permisoID;
      await perfil.save();
      if (req.session.usuario.perfil.ID == id)
        req.session.usuario.perfil.color = color;
      res.json(perfil);
    } else {
      res.status(404).json({ error: "Perfil no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para desactivar un perfil por su ID
router.patch("/perfiles/:id/activado", async (req, res) => {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send("Usuario no posee permisos");
    return;
  }
  const { id } = req.params;
  try {
    const perfil = await Perfil.findByPk(id);
    if (perfil) {
      perfil.activado = !perfil.activado;
      await perfil.save();
      res.json(perfil);
    } else {
      res.status(404).json({ error: "Perfil no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export { router };
