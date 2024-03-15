import * as express from "express";
import { Sequelize } from "sequelize";
import {
    Etiqueta,
    SuscripcionesEtiqueta,
    Categoria,
  } from "./model.js";

const router = express.Router();

import { getPaginacion } from "./parametros.js";
import { mensajeError401, mensajeError404 } from "./mensajesError.js";



router.post("/", function (req, res) {
    if (req.session.usuario.perfil.permiso.ID < 3) {
      res.status(401).send(mensajeError401);
      return;
    }
    const { descripcion, categoriaID } = req.body;
    Etiqueta.create({ descripcion, categoriaID }).then(() => {
      res.status(200).send();
    });
  });
  
// TODO Refactor: cambiar este endpoint a categoría. Hacer que categoría acepte un parámetro de con o sin etiquetas.
router.get("/", function (req, res) {

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
  let PAGINACION = getPaginacion();
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
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

// TODO Refactor: Cambiar endpoint a etiqueta, los nombres son en singular.
// TODO Refactor: Cambiar todas las funciones async a sincrónicas. Usar then en los cuerpos, y funciones de Premises, en todo caso.
router.patch("/:id/activado", async (req, res) => {
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send(mensajeError401);
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
      res.status(404).json(mensajeError404);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {

  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send(mensajeError401);
    return;
  }
  const id = req.params.id;
  const { descripcion, categoriaID } = req.body;
  try {
    let etiqueta = await Etiqueta.findByPk(id, {
      include: [{ model: Categoria, as: "categoria" }],
    });
    if (!etiqueta) {
      return res.status(404).json(mensajeError404);
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

router.post("/:etiquetaID/suscripcion", function (req, res) {  
  let IDetiqueta = req.params.etiquetaID;

  Etiqueta.findByPk(IDetiqueta)
    .then((etiqueta) => {
      if (!etiqueta) {
        res.status(404).send({message: "Etiqueta no encontrada / disponible"});
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
              res.status(201).send(s);
              return;
            } else {
              res.status(401).send(mensajeError401);
            }
          })
          .catch((err) => {
            res.status(500).send({message: err.message});
          });
      }
    })
    .catch((err) => {
      res.status(500).send({message: err.message});
    });
});

router.delete("/:etiquetaID/suscripcion", function (req, res) {

  let IDetiqueta = req.params.etiquetaID;

  Etiqueta.findByPk(IDetiqueta)
    .then((etiqueta) => {
      if (!etiqueta) {
        res.status(404).send(mensajeError404);
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
              res.status(401).send(mensajeError401);
              return;
            } else {
              sus.fecha_baja = new Date().toISOString().split("T")[0];
              sus.save();
              res.status(201).send({message: "Suscripción cancelada"});
            }
          })
          .catch((err) => {
            res.status(500).send({message: err.message});
          });
      }
    })
    .catch((err) => {
      res.status(500).send({message: err.message});
    });
});
  

  

export { router };