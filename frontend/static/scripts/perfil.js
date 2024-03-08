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
                // TODO UX: Mejores alertas
                alert(`Error ${info.codigo}: ${txt}`);
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
                // TODO UX: Mejores alertas
                alert(`Error ${info.codigo}: ${txt}`);
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

  gEt("botonCambiarFoto").onclick = (e) => {
    modal.titulo = "Cambiar Foto de Perfil";
    modal.contenido = [
        new Formulario(
            "administracion-perfil-editar",
            `/api/usuario/imagen`,
            [
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
          )
    ];
  
    modal.redibujar();
  
  
    modalElemento.classList.add("is-active");
  };
