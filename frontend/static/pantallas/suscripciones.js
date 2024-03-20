import { Modal } from "../componentes/modal.js";
import { DesplazamientoInfinito, MensajeInterfaz } from '../componentes/todos.js'
import { Pregunta } from "../componentes/pregunta.js";
import { Pagina } from "../componentes/pagina.js";

function crearPagina(ruta, sesion) {
    let titulo = 'Tus Suscripciones';
    let modal = new Modal('General', 'modal-general');
    return new Pagina({
        ruta: ruta,
        titulo: titulo,
        sesion: sesion,
        partes: [
            modal,
            new DesplazamientoInfinito(
                'suscripciones-desplinf'
                ,`/api/suscripcion`
                ,p=>(new Pregunta({...p,suscripciones:[{suscriptoDNI:sesion.usuario.DNI}]}, modal, sesion.usuario)).render()
                ,null
                ,{
                    mensajeVacio:new MensajeInterfaz(MensajeInterfaz.GRIS,'Aparentemente no estás suscripto a ninguna pregunta.')
                }
            )
        ]
    });

}

export { crearPagina as PantallaSuscripciones }