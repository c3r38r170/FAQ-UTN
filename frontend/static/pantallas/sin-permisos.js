import { Pagina, Modal } from "../componentes/todos.js";

function crearPagina(usuario, mensaje) {
  let modal = new Modal("General", "modal-general");
  return new Pagina({
    titulo: "Error: " + mensaje,
    sesion: usuario,
    partes: [modal],
  });
}

export { crearPagina as SinPermisos };
