import * as express from "express";
import {
  Parametro,
} from "./model.js";

import { setModera, setRechazaPost, setReportaPost, setResultadosPorPagina } from "./parametros.js"
import { mensajeError401 } from "./mensajesError.js";

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
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send(mensajeError401);
    return;
  }
  Parametro.findAll({
    attributes: ["ID", "descripcion", "valor"]
  }).then((parametros) => {
    res.send(parametros);
  });
});

router.patch("/:ID", function (req, res) {
  if (req.session.usuario.perfil.permiso.ID < 3) {
    res.status(401).send(mensajeError401);
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