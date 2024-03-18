import { gEt } from "../libs/c3tools.js";
import { Formulario, ComponenteLiteral } from "../componentes/todos.js";
import { PantallaAdministracionPerfiles } from "../pantallas/administracion-perfiles.js";

let pagina = PantallaAdministracionPerfiles(location.pathname, {
  usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[1];
tabla.iniciar();

let modalElemento = gEt("modal-eliminar-perfil");
modalElemento.addEventListener("submit", () => {
  modalElemento.classList.remove("is-active");
});

// TODO Feature: Que al volver para atrás (por historial) se mantenga la paginación. localStorage? dejar que el caché de chrome se encargue?
gEt("administrar-perfiles").onchange = (e) => {
  let checkbox = e.target;
  if (checkbox.type != "checkbox") {
    return;
  }

  // TODO UX: Deshacer el cambio si se sale del modal. Esto no se puede implementar rápido porque el handler de cerrado está en pagina, no en modal.
  checkbox.checked = !checkbox.checked;

  let ID = checkbox.value;

  let indicePerfilElegido = tabla.entidades.findIndex(
    ({ ID: esteID }) => esteID == ID
  );
  let perfilElegido = tabla.entidades[indicePerfilElegido];

  // TODO Refactor: Aplicar DRY a lo que se pueda.
  // ! Se deben crear nuevos formularios porque el valor de la ID del perfil elegido estará en el indice, en el endpoint, y en más lógica dentro del manipulador de respuesta.
  if (perfilElegido.activado) {
    // * Se desea desactivar / deshabilitar
    modal.titulo = "Deshabilitar " + perfilElegido.descripcion;
    modal.contenido = [
      new ComponenteLiteral(
        () => `<big><b><p>¿Estás seguro?</p></b></big><br/>`
      ),
      new Formulario(
        "administracion-perfiles-deshabilitar",
        `/api/perfil/${ID}/activado`,
        [],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indicePerfilElegido].ID == ID) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = false;

              tabla.entidades[indicePerfilElegido].activado = false;
            }
          } else {
            checkbox.checked = true;
            Swal.error(`Error ${info.codigo}: ${txt}`);
          }

          checkbox.disabled = false;
        },
        {
          verbo: "PATCH",
          textoEnviar: "Deshabilitar perfil",
          clasesBoton: "is-link is-rounded mt-3",
          alEnviar: () => (checkbox.disabled = true),
        }
      ),
    ];
  } else {
    // * Se desea activar / habilitar
    modal.titulo = "Habilitar a " + perfilElegido.descripcion;
    modal.contenido = [
      new Formulario(
        "administracion-perfiles-deshabilitar",
        `/api/perfil/${ID}/activado`,
        [],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indicePerfilElegido].ID == ID) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = true;

              tabla.entidades[indicePerfilElegido].activado = true;
            }
          } else {
            checkbox.checked = false;
            Swal.error(`Error ${info.codigo}: ${txt}`);
          }

          checkbox.disabled = false;
        },
        {
          verbo: "PATCH",
          textoEnviar: "Habilitar perfil",
          clasesBoton: "is-link is-rounded mt-3",
          alEnviar: () => (checkbox.disabled = true),
        }
      ),
    ];
  }

  modal.redibujar();
  modalElemento.classList.add("is-active");
};

gEt("administrar-perfiles").onclick = (e) => {
  let boton = e.target;
  if (boton.type != "button") {
    return;
  }

  let ID = boton.id.split("-")[2]; // TODO Refactor: Usar datasets? Hace falta que el boton tenga id?

  let indicePerfilElegido = tabla.entidades.findIndex(
    ({ ID: esteID }) => esteID == ID
  );
  let perfilElegido = tabla.entidades[indicePerfilElegido];

  modal.titulo = "Editar a " + perfilElegido.descripcion;
  modal.contenido = [
    new Formulario(
      "administracion-perfiles-editar",
      `/api/perfil/${ID}`,
      [
        {
          name: "nombre",
          textoEtiqueta: "Descripción:",
          type: "text",
          value: perfilElegido.descripcion,
        },
        {
          name: "color",
          textoEtiqueta: "Color:",
          type: "color",
          value: perfilElegido.color,
        },
        {
          name: "permisoID",
          textoEtiqueta: "Nivel",
          type: "select",
          value: perfilElegido.permiso.ID,
        },
      ],
      (txt, info) => {
        if (info.ok) {
          if (tabla.entidades[indicePerfilElegido].ID == ID) {
            // * Si se sigue en la misma página
            // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
            //TODO Feature: DRY
            let tab = document.getElementById("administrar-perfiles");
            tab.rows[
              indicePerfilElegido + 1
            ].cells[0].innerHTML = `<div class="perfil" style="background-color: ${JSON.parse(txt).color
              }"><div class="descripcion">${JSON.parse(txt).descripcion}</div></div>`;
            tab.rows[indicePerfilElegido + 1].cells[1].innerText =
              JSON.parse(txt).permisoID == 1
                ? "Usuario"
                : JSON.parse(txt).permisoID == 2
                  ? "Moderación"
                  : "Administración";
            perfilElegido.descripcion = JSON.parse(txt).descripcion;
            perfilElegido.color = JSON.parse(txt).color;
            perfilElegido.permisoID = JSON.parse(txt).permisoID;
          }
        } else {
          checkbox.checked = true;
          Swal.error(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "PATCH",
        textoEnviar: "Editar perfil",
        clasesBoton: "is-link is-rounded mt-3",
      }
    ),
  ];

  modal.redibujar();

  let select = document.getElementsByName("permisoID")[0];

  var options = [
    {
      text: "Usuario",
      value: 1,
      selected: 1 == perfilElegido.permisoID,
    },
    {
      text: "Moderación",
      value: 2,
      selected: 2 == perfilElegido.permisoID,
    },
    {
      text: "Administración",
      value: 3,
      selected: 3 == perfilElegido.permisoID,
    },
  ];
  options.forEach((option) => {
    var o = document.createElement("option");
    o.text = option.text;
    o.value = option.value;
    if (option.selected) {
      o.selected = true;
    }
    select.add(o);
  });

  modalElemento.classList.add("is-active");
};

gEt("botonAgregar").onclick = (e) => {
  modal.titulo = "Agregar Perfil";
  modal.contenido = [
    new Formulario(
      "administracion-perfiles-agregar",
      `/api/perfil`,
      [
        {
          name: "nombre",
          textoEtiqueta: "Nombre",
          type: "text",
        },
        {
          name: "color",
          textoEtiqueta: "Color:",
          type: "color",
        },
        {
          name: "permisoID",
          textoEtiqueta: "Nivel",
          type: "select",
        },
      ],
      (txt, info) => {
        if (info.ok) {
          // TODO UX: Mantener filtros o página...
          window.location.reload();
        } else {
          Swal.error(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "POST",
        textoEnviar: "Agregar perfil",
        clasesBoton: "is-link is-rounded mt-3",
      }
    ),
  ];

  modal.redibujar();

  let select = document.getElementsByName("permisoID")[0];
  var options = [
    {
      text: "Usuario",
      value: 1,
    },
    {
      text: "Moderación",
      value: 2,
    },
    {
      text: "Administración",
      value: 3,
    },
  ];
  options.forEach((option) => {
    var o = document.createElement("option");
    o.text = option.text;
    o.value = option.value;
    select.add(o);
  });

  modalElemento.classList.add("is-active");
};
