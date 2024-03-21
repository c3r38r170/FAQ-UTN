import { PaginaPerfilPropioInfo } from "../pantallas/perfil-propio-info.js";
import { gEt, SqS } from "../libs/c3tools.js";
import { Modal } from "../componentes/modal.js";

let usuario=window.usuarioActual;
let pagina= PaginaPerfilPropioInfo(location.pathname, {usuario}, {DNI:usuario.DNI});
pagina.partes[2]/* ! DesplazamientoInfinito */.pagina=2;

let modal = pagina.partes[0];

let modalElemento = gEt("modal-general");
modalElemento.addEventListener("submit", () => {
  modalElemento.classList.remove("is-active");
});

gEt("botonCambiarContraseña").onclick = (e) => {
    let boton = e.target;
    if (boton.type != "button") {
      return;
    }
  
    modal.titulo = "Cambiar Contraseña";
    modal.contenido = [
        new Formulario(
            "administracion-perfil-editar",
            `/api/usuario/contrasenia`,
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
            ],
            (txt, info) => {
              if (info.ok) {
                
                window.location.reload();
      
              } else {
                Swal.error(`Error ${info.codigo}: ${txt}`);
              }
            },
            {
              verbo: "PATCH",
              textoEnviar: "Editar usuario",
              clasesBoton: "is-link is-rounded mt-3",
            }
          )
    ];
  
    modal.redibujar();
  
  
    modalElemento.classList.add("is-active");
  };

  gEt("botonCambiarMail").onclick = (e) => {
    let boton = e.target;
    if (boton.type != "button") {
      return;
    }
    modal.titulo = "Cambiar Mail";
    modal.contenido = [
        new Formulario(
            "administracion-perfil-editar",
            `/api/usuario/mail`,
            [
              {
                name: "correo",
                textoEtiqueta: "Correo:",
                type: "email",
              },
              {
                name: "contrasenia",
                textoEtiqueta: "Contraseña:",
                type: "password",
              },
            ],
            (txt, info) => {
              if (info.ok) {
                
                window.location.reload();
      
              } else {
                Swal.error(`Error ${info.codigo}: ${txt}`);
              }
            },
            {
              verbo: "PATCH",
              textoEnviar: "Editar usuario",
              clasesBoton: "is-link is-rounded mt-3",
            }
          )
    ];
  
    modal.redibujar();
  
  
    modalElemento.classList.add("is-active");
  };

  gEt("cambiarFoto").onclick = (e) => {

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg, image/png';
    input.onchange = function(event) {
        var file = event.target.files[0];
        var formData = new FormData();
        formData.append('image', file);
        fetch('/api/usuario/imagen', {
            method: 'PATCH',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
              Swal.error(`Error al actualizar la imagen. Reintente más tarde.`);
            }
        })
        .catch(error => {
            console.error('Error de red:', error);
        });
    }
    input.click();
  };

