import * as express from "express";
import { Sequelize } from "sequelize";
import path from "path";
import * as bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import multer from "multer";
import {
    Usuario,
    Perfil,
    Permiso,
    Pregunta,
    ReportesUsuario,
    Post,
    Respuesta,
    Carrera,
    Bloqueo,
    CarrerasUsuario
  } from "./model.js";
import { getPaginacion } from "./parametros.js";
import * as SYSACAD from './sysacad.js';


const router = express.Router();

const upload = multer({
  storage:multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './storage/img')
    },
    filename: function (req, file, cb) {
      cb(null, "imagenPerfil-" + req.session.usuario.DNI+".jpg")
    },
    
  }),
  fileFilter: function(req, file, cb){
    const allowedExtensions = ['.jpg', '.png']; // Add more extensions as needed
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true); // Accept the file
    } else {
        cb(null, false); // Reject the file
    }
  }
})

router.get("/:DNI/foto", function(req, res){
  res.sendFile("imagenPerfil-"+req.params.DNI+".jpg", {'root': './storage/img'}, (err)=>{
    if (err) {
      res.sendFile("user.webp", {'root': './storage/img'})
    }
  });
});

router.get("/", function (req, res) {
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
  
  let PAGINACION = getPaginacion();
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
        separated : true,
      },
    );
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


router.get("/:DNI/preguntas", function (req, res) {
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

router.get("/:DNI/posts", function (req, res) {
  Post.pagina({ pagina: req.query.pagina||null, DNI: req.params.DNI }).then((posts) => res.send(posts));
});

router.get("/:DNI/respuestas", function (req, res) {
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

router.post("/", (req, res) => {
  let perfilID = req.body.perfilID ? req.body.perfilID : 1;
  Usuario.findAll({
    where: { DNI: req.body.DNI },
    raw: true,
    nest: true,
    plain: true,
  })
    .then((usu) => {
      if (usu) {
        return res.status(400).send("El Usuario ya se encuentra registrado");
      }
      const DNI=req.body.DNI
      let encontrado=SYSACAD.obtenerDatosPorDNI(DNI);
      if(!encontrado){
        return res.status(404).send("El DNI especificado no se encuentra en la base de datos de la facultad.");
      }

      // TODO Refactor: DRY, reviso encontrado.carreras 2 veces
      if(!encontrado.carreras){
        // TODO Feature: Hacer la decisión entre 1 y 2 si no hay sesión con permisos acá.
        if(perfilID==1){
          perfilID=4; // ! "Profesor"
        }
      }

      let esperarA=[
        Usuario.create({
          nombre: encontrado.nombre,
          DNI,
          correo: req.body.correo||encontrado.correo,
          contrasenia: req.body.contrasenia,
          perfilID
        })
      ];

      if(encontrado.carreras){
        esperarA.push(CarrerasUsuario.bulkCreate(encontrado.carreras.map(({ID,legajo})=>({
          usuarioDNI:DNI,
          carreraID:ID,
          Legajo:legajo
        }))));
        // datos.carreras=encontrado.carreras;
      }

      Promise.all(esperarA)
        .then(([usu])=>Usuario.findByPk(usu.DNI,{
          include:[{
            model: Perfil,
            include:Permiso,
          }, Carrera]
        }))
        .then(usuarioCompleto=>{
          // console.log(usuarioCompleto);
          if(!req.session.usuario)
            req.session.usuario=usuarioCompleto;
          res.status(200).send("Registro exitoso");
        });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

//Te deja reinciar la contra de cualquiera lol
router.post("/:DNI/contrasenia", function (req, res) {
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

    Promise.all([
      nodemailer
        .createTransport({
          host: process.env.CORREO_HOST,
          port: process.env.CORREO_PORT,
          secure: true, // Use `true` for port 465, `false` for all other ports
          auth: {
            user: process.env.CORREO_USER,
            pass: process.env.CORREO_PASS,
          },
        })
        .sendMail({
          from: '"UTN FAQ - Recuperación de contraseña" <maddison53@ethereal.email>', // sender address
          to: usu.correo, // list of receivers
          subject: "UTN FAQ - Recuperación de contraseña", // Subject line
          text: `¡Saludos, ${usu.nombre}! Tu contraseña temporal es "${contraseniaNueva}" (sin comillas).`, // plain text body
          html: `<big>¡Saludos, ${usu.nombre}!</big><br/><p>Se ha reestablecido tu contraseña, tu nueva contraseña temporal es:</p><pre>${contraseniaNueva}}</pre><p>No olvides cambiarla por otra / personalizarla cuando entres.</p><p><a href=${process.env.DIRECCION}>¡Te esperamos!</a></p>`, // html body
        })
      ,usu.save()
    ])
      .then(res.status(200).send("Se ha reestablecido la contraseña. Revise su correo electrónico para poder acceder."));
  });
});

router.post("/:DNI/reporte", function (req, res) {
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

router.post("/:DNI/bloqueo", function (req, res) {
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

router.delete("/:DNI/bloqueo", function (req, res) {
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

router.patch("/imagen", upload.single("image"), function (req, res) {
  //req.file tiene la imagen
  if(!req.file){
    //req.file solo existe si la imagen cumple con los formatos de arriba
    res.status(400).send("Petición mal formada");
    return;
  }
  res.status(200).send("Imagen Actualizada");
});

router.patch("/contrasenia", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  Usuario.findByPk(req.session.usuario.DNI)
    .then((usuario) => {
      if(bcrypt.compare(req.body.contraseniaAnterior, usuario.contrasenia)){
        usuario.contrasenia = req.body.contraseniaNueva;
        req.session.usuario.contrasenia=req.body.contraseniaNueva;
        usuario.save();
        res.status(200).send("Datos actualizados exitosamente");
        return;
      }
      res.status(402).send("Contraseña anterior no válida")
      })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.patch("/mail", function (req, res) {
  if (!req.session.usuario) {
    res.status(401).send("Usuario no tiene sesión válida activa");
    return;
  }
  Usuario.findByPk(req.session.usuario.DNI)
    .then((usuario) => {
      if(bcrypt.compare(req.body.contrasenia, usuario.contrasenia)){
        usuario.correo = req.body.correo;
        req.session.usuario.correo=req.body.correo;
        usuario.save();
        res.status(200).send("Datos actualizados exitosamente");
        return;
      }
      res.status(402).send("Contraseña anterior no válida")
      })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.patch("/:DNI", function (req, res) {
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


export { router };