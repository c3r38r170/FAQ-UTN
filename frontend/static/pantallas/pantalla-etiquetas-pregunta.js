import { Pagina, Modal, DesplazamientoInfinito, Pregunta } from "../componentes/todos.js";

function crearPagina(ruta,sesion, queryString=""){
    
    let modal = new Modal("General", "modal-general");
	let pagina = new Pagina({
        ruta: ruta,
        titulo: "Etiqueta",
        sesion: sesion,
        // TODO Refactor: Eliminar este archivo.
        partes: [
          modal,
          new DesplazamientoInfinito(
            "suscripciones-desplinf",
            '/api/pregunta'+queryString,
             (p) => new Pregunta(p, modal, sesion).render(),
          ),
        ],
      });
	return pagina;
}

export {crearPagina as PantallaEtiquetaPreguntas};