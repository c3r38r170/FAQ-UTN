import { gEt } from "../libs/c3tools.js";
import { Formulario, ComponenteLiteral } from "../componentes/todos.js";
import { PantallaAdministracionEtiquetas } from "../pantallas/administracion-etiquetas.js";

let pagina = PantallaAdministracionEtiquetas(location.pathname, {
  usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[2];

tabla.iniciar();

let modalElemento = gEt("modal-eliminar-etiqueta");
modalElemento.addEventListener("submit", () => {
  modalElemento.classList.remove("is-active");
});

// TODO Feature: Que al volver para atrás (por historial) se mantenga la paginación. localStorage? dejar que el caché de chrome se encargue?
gEt("administrar-etiquetas").onchange = (e) => {
  let checkbox = e.target;
  if (checkbox.type != "checkbox") {
    return;
  }

  // TODO UX: Deshacer el cambio si se sale del modal. Esto no se puede implementar rápido porque el handler de cerrado está en pagina, no en modal.
  checkbox.checked = !checkbox.checked;

  let ID = checkbox.value;

  let indiceEtiquetaElegida = tabla.entidades.findIndex(
    ({ ID: esteID }) => esteID == ID
  );
  let etiquetaElegida = tabla.entidades[indiceEtiquetaElegida];

  // TODO Refactor: Aplicar DRY a lo que se pueda.
  // ! Se deben crear nuevos formularios porque el valor del ID de la etiqueta elegida estará en el indice, en el endpoint, y en más lógica dentro del manipulador de respuesta.
  if (etiquetaElegida.activado) {
    // * Se desea desbloquear
    modal.titulo = "Deshabilitar " + etiquetaElegida.descripcion;
    modal.contenido = [
      new ComponenteLiteral(
        () => `<big><b><p>¿Estás seguro?</p></b></big><br/>`
      ),
      new Formulario(
        "administracion-etiquetas-deshabilitar",
        `/api/etiqueta/${ID}/activado`,
        [],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indiceEtiquetaElegida].ID == ID) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = false;

              tabla.entidades[indiceEtiquetaElegida].activado = false;
            }
          } else {
            checkbox.checked = true;
            Swal.error(`Error ${info.codigo}: ${txt}`);
          }

          checkbox.disabled = false;
        },
        {
          verbo: "PATCH",
          textoEnviar: "Deshabilitar etiqueta",
          clasesBoton: "is-link is-rounded mt-3",
          alEnviar: () => (checkbox.disabled = true),
        }
      ),
    ];
  } else {
    // * Se desea bloquear
    modal.titulo = "Habilitar a " + etiquetaElegida.descripcion;
    modal.contenido = [
      new Formulario(
        "administracion-etiqueta-deshabilitar",
        `/api/etiqueta/${ID}/activado`,
        [],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indiceEtiquetaElegida].ID == ID) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = true;

              tabla.entidades[indiceEtiquetaElegida].activado = true;
            }
          } else {
            checkbox.checked = false;
            Swal.error(`Error ${info.codigo}: ${txt}`);
          }

          checkbox.disabled = false;
        },
        {
          verbo: "PATCH",
          textoEnviar: "Habilitar etiqueta",
          clasesBoton: "is-link is-rounded mt-3",
          alEnviar: () => (checkbox.disabled = true),
        }
      ),
    ];
  }

  modal.redibujar();
  modalElemento.classList.add("is-active");
};

gEt("administrar-etiquetas").onclick = (e) => {
  let boton = e.target;
  if (boton.type != "button") {
    return;
  }

  let ID = boton.id.split("-")[2];

  let indiceEtiquetaElegida = tabla.entidades.findIndex(
    ({ ID: esteID }) => esteID == ID
  );
  let etiquetaElegida = tabla.entidades[indiceEtiquetaElegida];

  modal.titulo = "Editar la etiqueta \"" + etiquetaElegida.descripcion+'"';
  modal.contenido = [
    new Formulario(
      "administracion-etiquetas-editar",
      `/api/etiqueta/${ID}`,
      [
        {
          name: "descripcion",
          textoEtiqueta: "Descripción",
          type: "text",
          value: etiquetaElegida.descripcion,
        },
        // TODO Refactor: Esta lista tiene un undefined invisible en la list de hijos, antes de los option
        {
          name: "categoriaID",
          textoEtiqueta: "Categoría:",
          type: "select",
        }
      ],
      (txt, info) => {
        if (info.ok) {
          if (tabla.entidades[indiceEtiquetaElegida].ID == ID) {
            // * Si se sigue en la misma página
            // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
            let tab = document.getElementById("administrar-etiquetas");
            tab.rows[
              indiceEtiquetaElegida + 1
            ].cells[1].innerHTML = `<div class="categoria" style="background-color: ${JSON.parse(txt).categoria.color
            }"><div class="descripcion">${JSON.parse(txt).categoria.descripcion
              }</div></div>`;
            tab.rows[indiceEtiquetaElegida + 1].cells[0].innerText =
              JSON.parse(txt).descripcion;
            etiquetaElegida.descripcion = JSON.parse(txt).descripcion;
            etiquetaElegida.categoria = JSON.parse(txt).categoria;
          }
        } else {
          Swal.error(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "PATCH",
        textoEnviar: "Editar etiqueta",
        clasesBoton: "is-link is-rounded mt-3",
      }
    ),
  ];

  modal.redibujar();

  let select = document.getElementsByName("categoriaID")[0];

  fetch("/api/categoria").then((options) => {
    options.json().then((options) => {
      options.forEach((option) => {
        var o = document.createElement("option");
        o.text = option.descripcion;
        o.value = option.ID;
        if (option.ID == etiquetaElegida.categoria.ID) {
          o.selected = true;
        }
        select.add(o);
      });
    });
  }).catch(error => {
    console.error('Error con categorias:', error);
  });

  modalElemento.classList.add("is-active");
};

gEt("botonAgregar").onclick = (e) => {
  modal.titulo = "Agregar Etiquetas";
  modal.contenido = [
    new Formulario(
      "administracion-etiquetas-agregar",
      `/api/etiqueta`,
      [
        {
          name: "descripcion",
          textoEtiqueta: "Descripción",
          type: "text",
        },
        {
          name: "categoriaID",
          textoEtiqueta: "Categoria:",
          type: "select",
        },
      ],
      (txt, info) => {
        if (info.ok) {
          // * Si se sigue en la misma página
          // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
          //TODO UX: Mantener filtros, página...
          window.location.reload();
        } else {
          Swal.error(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "POST",
        textoEnviar: "Agregar Etiqueta",
        clasesBoton: "is-link is-rounded mt-3",
      }
    ),
  ];

  modal.redibujar();

  let select = document.getElementsByName("categoriaID")[0];

  fetch("/api/categoria").then((options) => {
    options.json().then((options) => {
      options.forEach((option) => {
        var o = document.createElement("option");
        o.text = option.descripcion;
        o.value = option.ID;
        select.add(o);
      });
    });
  }).catch(error => {
    console.error('Error con categorias:', error);
  });

  modalElemento.classList.add("is-active");
};
