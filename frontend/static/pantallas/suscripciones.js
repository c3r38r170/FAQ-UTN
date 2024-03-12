import { Modal } from "../componentes/modal.js";
import { DesplazamientoInfinito } from '../componentes/todos.js'
import { Pregunta } from "../componentes/pregunta.js";
import { Pagina } from "../componentes/pagina.js";

function crearPagina(ruta, sesion){
    let titulo = 'Tus Suscripciones';
    let modal = new Modal('General','modal-general');
    return new Pagina({
        ruta:ruta,
        titulo: titulo,
        sesion:sesion,
        partes:[
            modal,
            new DesplazamientoInfinito(
                'suscripciones-desplinf'
        ,`/api/suscripcion`
        ,p=>(new Pregunta(p, modal, sesion)).render()
            )
        ]
    });

}

export {crearPagina as PaginaSuscripciones}