import * as express from "express";
const router = express.Router();
import { Pagina, Busqueda } from "../frontend/componentes.js";
import { Pregunta } from "../frontend/static/componentes/pregunta.js";

router.get("/", (req, res) => {
  let pagina = new Pagina({
    ruta: req.path,
    titulo: "Inicio",
    sesion: req.session.usuario,
  });
  pagina.partes.push(new Busqueda('Hola'))
  res.send(pagina.render());
});

router.get("/perfil/:id?", (req, res) => {
  let pagina = new Pagina({
    ruta: req.path,
    titulo: "Perfil",
    sesion: req.session.usuario,
  });
  res.send(pagina.render());
});
router.get("/pregunta/:id?", (req, res) => {
  let pagina = new Pagina({
    ruta: req.path,
    titulo: "Perfil",
    sesion: req.session.usuario,
  });
  pagina.partes.push( new Pregunta({
	  titulo: "Este es el titulo",
	  cuerpo:
		"Lorem Ipsum is simply dummy text of the printing and the industrys standard dummy text ever since the 1500s?",
	  fecha: "31 de Marzo de 2023",
	}))
  res.send(pagina.render());
});

router.get("/componentes", (req, res) => {
  let pagina = new Pagina({
    ruta: req.path,
    titulo: "Componentes",
    sesion: req.session.usuario,
  });
  res.send(pagina.render());
});

export { router };
