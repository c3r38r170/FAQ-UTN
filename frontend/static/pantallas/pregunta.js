import { Modal } from "../componentes/modal.js";
import { Pagina } from "../componentes/pagina.js";

function PaginaPregunta(ruta, sesion){
    let pagina = new Pagina({
        ruta: ruta,
        titulo: '',
        sesion: sesion
    });


    let modal = new Modal('General','modal-general');
    pagina.partes.push(modal);

    /*pagina.partes.push(
    // TODO Feature: Diferenciar de la implementación en / así allá aparece la primera respuesta y acá no.
    new Pregunta(p, modal)
                // TODO Feature: Considerar traer directamente todas las respuestas, en vez de paginarlas.
            // DesplazamientoInfinito de respuestas; sin fin de mensaje
    //,...p.respuestas.map(r=>new Respuesta(r))
                // Formulario de respuesta
    );*/
    return pagina;
}

export {PaginaPregunta};