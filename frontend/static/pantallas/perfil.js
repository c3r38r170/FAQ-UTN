import { Modal } from "../componentes/modal.js";
import { ChipUsuario, ComponenteLiteral, DesplazamientoInfinito, MensajeInterfaz, Boton } from '../componentes/todos.js'
import { Pregunta } from "../componentes/pregunta.js";
import { Pagina } from "../componentes/pagina.js";

function crearPagina(ruta, usuario, usu, perfilBloqueado = false) {
    let titulo = ((usuario && usu.DNI && usuario.DNI == usu.DNI) || (usuario && !usu.DNI)) ? 'Mi Perfil' : 'Perfil de ' + usu.nombre;
    let modal = new Modal('General', 'modal-general');
    let posibleBotonModerar;
    let posibleMensajeUsuarioBloqueado;
    if (usuario.usuario?.perfil.permiso.ID > 1 && usuario.usuario?.DNI != usu.DNI) {
        let boton;
        if (perfilBloqueado) {
            boton = `<button id="botonDesbloquear" data-DNI="${usu.DNI}" type="button" class="button is-warning is-light is-small is-rounded">Desbloquear</button>`
            posibleMensajeUsuarioBloqueado = new MensajeInterfaz(MensajeInterfaz.GRIS, 'Este usuario se encuentra bloqueado')
        } else {
            boton = `<button id="botonBloquear" data-DNI="${usu.DNI}" type="button" class="button is-warning is-small is-rounded">Bloquear</button>`
            posibleMensajeUsuarioBloqueado = new ComponenteLiteral(() => ``)
        }
        posibleBotonModerar = new ComponenteLiteral(() => `<div class="contenedor-boton-bloqueo">${boton}</div> `)
    } else if (usuario.usuario?.DNI != usu.DNI && usuario.usuario) {
        let boton;
        boton = `<button id="botonReportar" data-DNI="${usu.DNI}" type="button" class="button is-warning is-small is-rounded">Reportar</button>`
        posibleMensajeUsuarioBloqueado = new ComponenteLiteral(() => ``)
        posibleBotonModerar = new ComponenteLiteral(() => `<div class="contenedor-boton-bloqueo">${boton}</div> `)
    }
    else {
        posibleMensajeUsuarioBloqueado = new ComponenteLiteral(() => ``)
        posibleBotonModerar = new ComponenteLiteral(() => ``)
    };

    return new Pagina({
        ruta: ruta,
        titulo: titulo,
        sesion: usuario,
        partes: [
            modal,
            posibleMensajeUsuarioBloqueado,
            posibleBotonModerar,
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