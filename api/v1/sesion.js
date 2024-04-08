import * as express from "express";
import { Sequelize } from "sequelize";
import { Usuario, Perfil, Permiso, Carrera, Bloqueo } from "./model.js"

import * as bcrypt from "bcrypt";

const router = express.Router();
router.post("/", function (req, res) {
  let usuario;
  Usuario.findByPk(req.body.DNI, {
    include: [{
      model: Perfil,
      include: Permiso,
    }, {
      model: Carrera
    }, {
      model: Bloqueo,
      as: "bloqueosRecibidos",
      where: {
        fecha_desbloqueo: { [Sequelize.Op.is]: null }
      },
      required: false
    }]
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
        if (usuario.bloqueosRecibidos.length > 0) {
          res.status(402).send("Usuario bloqueado")
          return;
        }
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
      res.status(500).send(err.message);
      return;
    });
});

router.delete("/", function (req, res) {
  req.session.destroy();
  res.status(200).send();
});



export { router };