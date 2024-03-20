import { Modal } from "../componentes/modal.js";
import { ChipUsuario, DesplazamientoInfinito, MensajeInterfaz } from '../componentes/todos.js'
import { Pregunta } from "../componentes/pregunta.js";
import { Pagina } from "../componentes/pagina.js";

function crearPagina(ruta, usuario, usu) {
    let titulo = ((usuario && usu.DNI && usuario.DNI == usu.DNI) || (usuario && !usu.DNI)) ? 'Mi Perfil' : 'Perfil de ' + usu.nombre;
    let modal = new Modal('General', 'modal-general');
    return new Pagina({
        ruta: ruta,
        titulo: titulo,
        sesion: usuario,
        partes: [
            modal,
            new ChipUsuario(usu, true, false)
            , new DesplazamientoInfinito(
                'perfil-desplinf'
                , `/api/usuario/${usu.DNI}/posts`
                , p => (new Pregunta(p, modal, usuario.usuario)).render()
                , null
                , {
                    mensajeVacio: new MensajeInterfaz(
                        MensajeInterfaz.INFORMACION
                        // ,'Este usuario todavía no ha publicado nada.'
                        , 'No hay contenido para mostrar.'
                    )
                }
            )
        ]
    });

}

export { crearPagina as PaginaPerfil }