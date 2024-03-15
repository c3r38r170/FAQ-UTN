import * as express from "express";
import {
  Etiqueta,
  Categoria,
} from "./model.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let categorias;
    // TODO Refactor: raw? nest?
    if (!!+req.query.etiquetas) {
      //cuando usamos esto?
      categorias = await Categoria.findAll({
        include: {
          model: Etiqueta,
          as: 'etiquetas'
        },
        attributes: ['ID', 'descripcion', 'color', 'activado']
      });
    } else {
      categorias = await Categoria.findAll({
        attributes: ['ID', 'descripcion', 'color', 'activado']
      });
    }
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/activado", async (req, res) => {
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
router.post("/", async (req, res) => {

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
router.patch("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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




export { router };