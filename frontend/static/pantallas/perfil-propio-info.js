import { ChipUsuario, Modal, Pagina } from '../componentes/todos.js'

function crearPagina(ruta, sesion){
    let titulo = 'Mi perfil'
    let modal = new Modal('General','modal-general');
    return new Pagina({
        ruta:ruta,
        titulo: titulo,
        sesion:sesion,
        partes:[
            modal,
            new ChipUsuario(sesion.usuario, true)
        ]
    });

}

export {crearPagina as PaginaPerfilPropioInfo}