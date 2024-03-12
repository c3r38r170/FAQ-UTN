import * as express from "express";
import {
    Perfil, Permiso, Parametro
  } from "./model.js";

import { getPaginacion } from "./parametros.js";
const router = express.Router();

// Ruta para crear un nuevo perfil
router.post("/", async (req, res) => {
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
  router.patch("/:id", async (req, res) => {
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
  router.patch("/:id/activado", async (req, res) => {
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

  
  router.get("/", async (req, res) => {
    try {
      if(req.query.todos){
        const perfiles = await Perfil.findAll({
          include: Permiso,
        });
        res.status(200).send(perfiles);
        return;
      }
      let PAGINACION = getPaginacion();
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

  export { router };