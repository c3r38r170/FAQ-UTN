import { PantallaAdministracionParametros } from "../pantallas/administracion-parametros.js";
import { gEt, SqS } from "../libs/c3tools.js";

let pagina = PantallaAdministracionParametros(
  location.pathname,
  { usuario: window.usuarioActual },
  window.parametros
);

let select = document.getElementsByName("ModerarIA")[0];

var options = [
  {
    text: "Sí",
    value: true,
    selected: window.parametros.ModerarIA == true,
  },
  {
    text: "No",
    value: false,
    selected: window.parametros.ModerarIA == false,
  },
];
options.forEach((option) => {
  var o = document.createElement("option");
  o.text = option.text;
  o.value = option.value;
  if (option.selected) {
    o.selected = true;
  }
  select.add(o);
});
