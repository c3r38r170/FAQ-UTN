import * as express from "express";
import {
    Parametro,
  } from "./model.js";

import {setModera, setRechazaPost, setReportaPost, setResultadosPorPagina} from "./parametros.js"

const router = express.Router();

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


router.get("/", function (req, res) {
    Parametro.findAll().then((parametros) => {
      res.send(parametros);
    });
  });
  
  router.patch("/:ID", function (req, res) {
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
        setResultadosPorPagina(parseInt(req.body.valor));
      if (req.params.ID == 2) setModera(req.body.valor == "1");
      if (req.params.ID == 3) setRechazaPost(parseInt(req.body.valor));
      if (req.params.ID == 4) setReportaPost(parseInt(req.body.valor));
    });
  });

  

  

export { router };