import { gEt, SqS } from "../libs/c3tools.js";
import { PantallaModeracionUsuarios } from "../pantallas/moderacion-usuarios.js";
import { Titulo, Formulario, ComponenteLiteral } from "../componentes/todos.js";

let pagina = PantallaModeracionUsuarios(location.pathname, {
  usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[1];
tabla /* ! Tabla */
  .iniciar();

let modalElemento = gEt("moderacion-usuarios-modal");
modalElemento.addEventListener("submit", () => {
  modalElemento.classList.remove("is-active");
});

// TODO Feature: Que al volver para atrás (por historial) se mantenga la paginación. localStorage? dejar que el caché de chrome se encargue?
gEt("moderacion-usuarios").onchange = (e) => {
  let checkbox = e.target;
  if (checkbox.type != "checkbox") {
    return;
  }

  // TODO UX: Deshacer el cambio si se sale del modal. Esto no se puede implementar rápido porque el handler de cerrado está en pagina, no en modal.
  checkbox.checked = !checkbox.checked;

  let DNI = checkbox.value;

  let indiceUsuarioElegido = tabla.entidades.findIndex(
    ({ DNI: esteDNI }) => esteDNI == DNI
  );
  let usuarioElegido = tabla.entidades[indiceUsuarioElegido];

  // TODO Refactor: Aplicar DRY a lo que se pueda.
  // ! Se deben crear nuevos formularios porque el valor del DNI del elegido estará en el indice, en el endpoint, y en más lógica dentro del manipulador de respuesta.
  if (usuarioElegido.bloqueosRecibidos.length) {
    // * Se desea desbloquear
    modal.titulo = "Desbloquear a " + usuarioElegido.nombre;
    modal.contenido = [
      // TODO Feature: Mostrar razón del desbloqueo, preguntar si se está seguro.
      new ComponenteLiteral(
        () =>
          `<big><b><p>¿Estás seguro?</p></b></big> <p><i>${usuarioElegido.nombre} fue bloqueado con el siguiente motivo:</i><br/>${usuarioElegido.bloqueosRecibidos[0].motivo}</p><br/>`
      ),
      new Formulario(
        "moderacion-usuarios-desbloquear",
        `/api/usuario/${DNI}/bloqueo`,
        [
          {
            name: "motivo",
            textoEtiqueta: "Motivo del desbloqueo:",
            type: "textarea",
          },
        ],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indiceUsuarioElegido].DNI == DNI) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = false;

              tabla.entidades[indiceUsuarioElegido].bloqueosRecibidos = [];
            }
          } else {
            checkbox.checked = true;
            // TODO UX: Mejores alertas
            alert(`Error ${info.codigo}: ${txt}`);
          }

          checkbox.disabled = false;
        },
        {
          verbo: "DELETE",
          textoEnviar: "Registrar motivo y desbloquear",
          clasesBoton: "is-link is-rounded mt-3",
          alEnviar: () => (checkbox.disabled = true),
        }
      ),
    ];
  } else {
    // * Se desea bloquear
    modal.titulo = "Bloquear a " + usuarioElegido.nombre;
    modal.contenido = [
      new Formulario(
        "moderacion-usuarios-desbloquear",
        `/api/usuario/${DNI}/bloqueo`,
        [
          {
            name: "motivo",
            textoEtiqueta: "Motivo del bloqueo:",
            type: "textarea",
          },
        ],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indiceUsuarioElegido].DNI == DNI) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = true;

              tabla.entidades[indiceUsuarioElegido].bloqueosRecibidos = [
                {
                  motivo: SqS(
                    '#moderacion-usuarios-desbloquear [name="motivo"]'
                  ).value,
                },
              ];
            }
          } else {
            checkbox.checked = false;
            // TODO UX: Mejores alertas
            alert(`Error ${info.codigo}: ${txt}`);
          }

          checkbox.disabled = false;
        },
        {
          verbo: "POST",
          textoEnviar: "Registrar motivo y bloquear",
          clasesBoton: "is-link is-rounded mt-3",
          alEnviar: () => (checkbox.disabled = true),
        }
      ),
    ];
  }

  modal.redibujar();
  modalElemento.classList.add("is-active");
};
