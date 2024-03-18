import * as express from "express";
import {
  Perfil, Permiso, Parametro
} from "./model.js";

import { getPaginacion } from "./parametros.js";
import { mensajeError401, mensajeError404 } from "./mensajesError.js";
const router = express.Router();

// Ruta para crear un nuevo perfil
router.post("/", async (req, res) => {
    if (req.session.usuario.perfil.permiso.ID < 3) {
      res.status(401).send(mensajeError401);
      return;
    }
    const { nombre, color, permisoID } = req.body;
    try {
      const nuevoPerfil = await Perfil.create({
        descripcion: nombre,
        color: color,
        permisoID: permisoID,
      });
      res.status(201).json(nuevoPerfil);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
  // Ruta para actualizar un perfil por su ID
  router.patch("/:id", async (req, res) => {
    if (req.session.usuario.perfil.permiso.ID < 3) {
      res.status(401).send(mensajeError401);
      return;
    }
    const { id } = req.params;
    const { nombre, color, permisoID } = req.body;
    try {
      const perfil = await Perfil.findByPk(id);
      if (perfil) {
        perfil.descripcion = nombre;
        perfil.color = color;
        perfil.permisoID = permisoID;
        await perfil.save();
        if (req.session.usuario.perfil.ID == id)
          req.session.usuario.perfil.color = color;
        res.json(perfil);
      } else {
        res.status(404).send(mensajeError404);
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
  // Ruta para desactivar un perfil por su ID
  router.patch("/:id/activado", async (req, res) => {
    if (req.session.usuario.perfil.permiso.ID < 3) {
      res.status(401).send(mensajeError401);
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
        res.status(404).send(mensajeError404);
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  
  router.get("/", async (req, res) => {
    try {
      if(req.query.todos){
        const perfiles = await Perfil.findAll({
          include:  {
            model: Permiso,
            attributes: ["ID", "descripcion"]
          },
          attributes: ["ID", "color", "permisoID", "descripcion", "activado"]
        });
        res.status(200).send(perfiles);
        return;
      }
      let PAGINACION = getPaginacion();
      let pagina = req.query.pagina ? req.query.pagina : 0;
      const perfiles = await Perfil.findAndCountAll({
        include:  {
          model: Permiso,
          attributes: ["ID", "descripcion"]
        },
        attributes: ["ID", "color", "permisoID", "descripcion", "activado"],
        limit: PAGINACION.resultadosPorPagina,
        offset:
          (+pagina * PAGINACION.resultadosPorPagina)
      });
      res.setHeader('untfaq-cantidad-paginas', Math.ceil(perfiles.count / parseInt(PAGINACION.resultadosPorPagina)));
      res.status(200).send(perfiles.rows);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

export { router };