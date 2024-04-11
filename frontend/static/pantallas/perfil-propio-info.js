import { Boton, ChipUsuario, Formulario, Modal, Pagina } from '../componentes/todos.js'

function crearPagina(ruta, sesion){
    let titulo = 'Mi perfil'
    let modal = new Modal('General','modal-general');
    return new Pagina({
        ruta:ruta,
        titulo: titulo,
        sesion:sesion,
        partes:[
            modal,
            new ChipUsuario(sesion.usuario, true, true),
            new Boton({
              titulo: "Cambiar Contraseña",
              classes: "button is-link is-small is-rounded botonAgregar m-3rem my-5",
              dataTarget: "modal-cambiar-contraseña",
              type: "button",
              id: "botonCambiarContraseña",
            }),
        ]
    });

}

export {crearPagina as PaginaPerfilPropioInfo}