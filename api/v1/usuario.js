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
  Voto,
  CarrerasUsuario
} from "./model.js";
import { getPaginacion } from "./parametros.js";
import * as SYSACAD from './sysacad.js';
import { mensajeError401, mensajeError403, mensajeError404 } from "./mensajesError.js";


const router = express.Router();

const upload = multer({
  // TODO Feature: Ver si subir un PNG anda. Encontrar la manera de servir los archivos correctamente según formato.
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './storage/img')
    },
    filename: function (req, file, cb) {
      cb(null, "imagenPerfil-" + req.session.usuario.DNI + ".jpg")
    },

  }),
  fileFilter: function (req, file, cb) {
    const allowedExtensions = ['.jpg', '.png']; // Add more extensions as needed
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true); // Accept the file
    } else {
      cb(null, false); // Reject the file
    }
  }
})

router.get("/:DNI/foto", function (req, res) {
  res.sendFile("imagenPerfil-" + req.params.DNI + ".jpg", { 'root': './storage/img' }, (err) => {
    if (err) {
      res.sendFile("user.webp", { 'root': './storage/img' })
    }
  });
});

router.get("/", function (req, res) {
  if (req.session.usuario.perfil.permiso.ID < 2) {
    res
      .status(403)
      .send(mensajeError403);
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
        attributes: ["motivo"],
        where: {
          fecha_desbloqueo: null,
        },
        required: false,
        include: {
          model: Usuario
          , as: 'bloqueador'
          , attributes: ['nombre']
        }
      },
      {
        model: ReportesUsuario,
        as: "reportesRecibidos",
        attributes: ["fecha"],
        required: true,
      }
    );
    order.push([Sequelize.col("reportesRecibidos.fecha"), "DESC"]);
  } else {
    include.push(
      {
        model: Bloqueo,
        as: "bloqueosRecibidos",
        // TODO Feature: Traer quién bloqueó
        attributes: ["motivo"],
        where: {
          fecha_desbloqueo: null,
        },
        required: false,
        separated: true,
        include: {
          model: Usuario
          , as: 'bloqueador'
          , attributes: ['nombre']
        }
      },
    );
  }
  let filtro = req.query.filtro;
  // TODO Docs: Documentar cuál es la diferencia entre estos...
  if (filtro) {
    where.DNI = { [Sequelize.Op.substring]: filtro };
    where.nombre = { [Sequelize.Op.substring]: filtro };
    include.push(Carrera);
    where["$carrera.legajo$"] = { [Sequelize.Op.substring]: filtro };
  } else if (req.query.searchInput) {

    where = {
      [Sequelize.Op.or]: [
        { DNI: { [Sequelize.Op.substring]: req.query.searchInput } },
        { nombre: { [Sequelize.Op.substring]: req.query.searchInput } },
        { '$perfil.descripcion$': { [Sequelize.Op.startsWith]: req.query.searchInput } }
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
        res.status(404).send(mensajeError404);
      } else {
        res.setHeader('untfaq-cantidad-paginas', Math.ceil(usuarios.count / PAGINACION.resultadosPorPagina));
        res.status(200).send(usuarios.rows);
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
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
      res.status(500).send(err.message)
    });
});

router.get("/:DNI/posts", function (req, res) {
  Post.pagina({ pagina: req.query.pagina || null, DNI: req.params.DNI }).then((posts) => res.send(posts));
});

router.get("/:DNI/respuestas", function (req, res) {
  let pagina = 0;
  if (req.query.pagina) {
    pagina = req.query.pagina;
  }

  Respuesta.pagina({ pagina, DNI: req.params.DNI })
    .then((posts) => res.send(posts));
});

router.post("/", (req, res) => {
  let perfilID = req.body.perfilID ? req.body.perfilID : 1;
  // TODO Refactor: mucho texto
  if (perfilID > 1) {
    if (req.session.usuario) {
      if (req.session.usuario.perfil.permiso.ID < 3) {
        perfilID = 1;
      }
    } else {
      perfilID = 1;
    }
  }
  const DNI = req.body.DNI
  Usuario.findAll({
    where: { DNI },
    raw: true,
    nest: true,
    plain: true,
  })
    .then((usu) => {
      if (usu) {
        return res.status(400).send("El Usuario ya se encuentra registrado");
      }
      return SYSACAD.obtenerDatosPorDNI(DNI);
    }).then((encontrado) => {
      if (!encontrado) {
        return res.status(404).send("El DNI especificado no se encuentra en la base de datos de la facultad.");
      }

      // TODO Refactor: DRY, reviso encontrado.carreras 2 veces
      if (!encontrado.carreras) {
        // TODO Feature: Hacer la decisión entre 1 y 2 si no hay sesión con permisos acá.
        if (perfilID == 1) {
          perfilID = 4; // ! "Profesor"
        }
      }

      let esperarA = [
        Usuario.create({
          nombre: encontrado.nombre,
          DNI,
          correo: req.body.correo || encontrado.correo,
          contrasenia: req.body.contrasenia,
          perfilID
        })
      ];

      if (encontrado.carreras) {
        esperarA.push(CarrerasUsuario.bulkCreate(encontrado.carreras.map(({ ID, legajo }) => ({
          usuarioDNI: DNI,
          carreraID: ID,
          Legajo: legajo
        }))));
      }

      Promise.all(esperarA)
        .then(([usu]) => Usuario.findByPk(usu.DNI, {
          include: [{
            model: Perfil,
            include: Permiso,
          }, Carrera]
        }))
        .then(usuarioCompleto => {
          if (!req.session.usuario)
            req.session.usuario = usuarioCompleto;
          res.status(200).send();
        });
    })
    .catch((err) => {
      // ! Este error solo puede ser provocado por SYSACAD.obtenerDatosPorDNI
      res.status(500).send(err?.message);
    });
});

router.post("/contrasenia", function (req, res) {
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

  Usuario.findAll({
    where: {
      DNI: req.body.DNI,
      correo: req.body.correo
    }
    , limit: 1
  }).then((usu) => {
    if (!usu[0]) {
      // TODO UX: ¿Separ casos? Se podría hacer el correo no obligatorio, y después revisar... A debatir igual, eh.
      res.status(404).send("DNI inexistente, o correo equivocado.");
      return;
    }

    let contraseniaNueva = generarContrasenia();
    usu[0].contrasenia = contraseniaNueva;

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
          from: `"UTN FAQ - Recuperación de contraseña" <${process.env.CORREO_USER}>`, // sender address
          to: usu[0].correo, // list of receivers
          subject: "UTN FAQ - Recuperación de contraseña", // Subject line
          text: `¡Saludos, ${usu[0].nombre}! Tu contraseña temporal es "${contraseniaNueva}" (sin comillas).`, // plain text body
          html: `<big>¡Saludos, ${usu[0].nombre}!</big><br/><p>Se ha reestablecido tu contraseña, tu nueva contraseña temporal es:</p><pre>${contraseniaNueva}</pre><p>No olvides cambiarla por otra / personalizarla cuando entres.</p><p><a href=${process.env.DIRECCION}>¡Te esperamos!</a></p>`, // html body
        })
      , usu[0].save()
    ])
      .then(res.status(200).send("Se ha reestablecido la contraseña. Revise su correo electrónico para poder acceder."));
  });
});

router.post("/:DNI/reporte", function (req, res) {
  Usuario.findByPk(req.params.DNI)
    .then((usuario) => {
      if (!usuario) {
        res.status(404).send(mensajeError404);
        return;
      } else {
        // TODO Refactor: Usar Sequelize, usuario.addReporteUsuario(new ReporteUsuario({reportante: ... o como sea }))
        ReportesUsuario
          .findOne({ where: { reportadoDNI: req.params.DNI } })
          .then(re => {
            if (re) {
              re.reportanteDNI = req.session.usuario.DNI;
              re.createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
              return re.save();
            } else {
              // ?? ReportesUsuario.ReportesUsuario.
              return ReportesUsuario.create({
                reportanteDNI: req.session.usuario.DNI,
                reportadoDNI: req.params.DNI,
              });
            }
          })
          .then(() => {
            res.status(201).send("Reporte registrado");
          })
        return;
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

router.post("/:DNI/bloqueo", function (req, res) {
  if (req.session.usuario.perfil.permiso.ID < 2) {
    res.status(401).send(mensajeError401);
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
        res.status(404).send(mensajeError404);
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
      res.status(500).send(err.message);
    });
});

router.delete("/:DNI/bloqueo", function (req, res) {
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
      res.status(404).send(mensajeError404);
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
  if (!req.file) {
    //req.file solo existe si la imagen cumple con los formatos de arriba
    res.status(400).send("Petición mal formada");
    return;
  }
  res.status(200).send("Imagen Actualizada");
});

router.patch("/contrasenia", async function (req, res) {
  Usuario.findByPk(req.session.usuario.DNI)
    .then((usuario) => {
      bcrypt.compare(req.body.contraseniaAnterior, usuario.contrasenia).then(coinciden => {
        if (coinciden) {
          usuario.contrasenia = req.body.contraseniaNueva;
          req.session.usuario.contrasenia = req.body.contraseniaNueva;
          usuario.save();
          res.status(200).send("Datos actualizados exitosamente");
          return;
        }
      });

      res.status(402).send("Contraseña anterior no válida")
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

router.patch("/mail", function (req, res) {
  Usuario.findByPk(req.session.usuario.DNI)
    .then((usuario) => {
      bcrypt.compare(req.body.contrasenia, usuario.contrasenia).then(coinciden => {
        if (coinciden) {
          usuario.correo = req.body.correo;
          req.session.usuario.correo = req.body.correo;
          usuario.save();
          res.status(200).send("Datos actualizados exitosamente");
          return;
        }
      });
      res.status(402).send("Contraseña anterior no válida")
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

router.patch("/:DNI", function (req, res) {
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send(mensajeError401);
    return;
  }
  Usuario.findByPk(req.params.DNI)
    .then((usuario) => {
      //TODO Feature: definir que mas puede cambiar y que constituye datos inválidos
      usuario.nombre = req.body.nombre;
      usuario.correo = req.body.correo;
      usuario.perfilID = req.body.perfilID;
      usuario.save();
      res.status(200).send("Datos actualizados exitosamente");
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});


router.get("/masRelevantes", function (req, res) {
  Post.findAll({
    attributes: [
      [Sequelize.literal('COALESCE(SUM(valoracion), 0)'), 'valoracion'],
      [Sequelize.fn('COUNT', Sequelize.col('post.ID')), 'cantPosts']
    ],
    include: [
      {
        model: Voto,
        attributes: [],
        required: false
      },
      {
        model: Usuario,
        as: 'duenio',
        include: {
          model: Perfil,
          attributes: ['ID', 'descripcion', 'color']
        },
        attributes: ['DNI', 'nombre']
      },
    ],
    order: req.query.votados ? req.query.votados == 0 ? [[Sequelize.literal('COALESCE(SUM(valoracion), 0)'), 'ASC']] : [[Sequelize.literal('COALESCE(SUM(valoracion), 0)'), 'DESC']] : [[Sequelize.literal('COUNT(post.ID)'), 'DESC']],
    group: ['DNI'], // Ajustando para agrupar por DNI del usuario
    subQuery: false,
    raw: true,
    nest: true,
    limit: getPaginacion().resultadosPorPagina,
    where:{eliminadorDNI:null}
  })
    .then(posts => {
      res.status(200).send(posts)
    })
    .catch(error => {
      res.status(400).send(error.message);
    });
})

// TODO Feature: Pantalla.
router.get("/masReportados", function (req, res) {
  Usuario.findAll({
    attributes: ['DNI', 'nombre'],
    // include: [],
    // ! Esto intenta ser un filtro de los no-bloqueados. Probar cuando se implemente la vista para esto.
    include:[{
      model:Bloqueo,
      as: "bloqueosRecibidos",
      required:true,
      where:{fecha_desbloqueo:null}
    }],
    where:{'$bloqueosRecibidos.ID$':null},

    group: ['DNI'], // Ajustando para agrupar por DNI del usuario
    subQuery: false,
    raw: true,
    nest: true,
    limit: getPaginacion().resultadosPorPagina,
  })
    .then(usuarios => {
      res.status(200).send(usuarios)
    })
    .catch(error => {
      res.status(400).send(error.message);
    });
})

export { router };