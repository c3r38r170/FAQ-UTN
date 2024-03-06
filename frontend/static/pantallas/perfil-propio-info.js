import { ChipUsuario, Formulario, Modal, Pagina } from '../componentes/todos.js'

function crearPagina(ruta, sesion){
    let titulo = 'Mi perfil'
    let modal = new Modal('General','modal-general');
    let form = new Formulario(
        "administracion-perfil-editar",
        `/api/usuario`,
        [
          {
            name: "contraseniaNueva",
            textoEtiqueta: "Contraseña nueva:",
            type: "password",
          },
          {
            name: "contraseniaAnterior",
            textoEtiqueta: "Contraseña anterior:",
            type: "password",
          },
          {
            name: "image",
            textoEtiqueta: "Imagen de Perfil: ",
            type: "file",
            extra: 'accept="image/jpeg, image/png'
          },
        ],
        (txt, info) => {
          if (info.ok) {
            
            window.location.reload();
  
          } else {
            // TODO UX: Mejores alertas
            alert(`Error ${info.codigo}: ${txt}`);
          }
        },
        {
          verbo: "PATCH",
          textoEnviar: "Editar usuario",
          clasesBoton: "is-link is-rounded mt-3",
        }
      );
    return new Pagina({
        ruta:ruta,
        titulo: titulo,
        sesion:sesion,
        partes:[
            modal,
            new ChipUsuario(sesion.usuario, true),
            form
        ]
    });

}

export {crearPagina as PaginaPerfilPropioInfo}