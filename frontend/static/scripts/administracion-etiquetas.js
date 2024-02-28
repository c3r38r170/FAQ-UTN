import { gEt, SqS } from "../libs/c3tools.js";
import { Titulo, Formulario, ComponenteLiteral } from "../componentes/todos.js";
import { PantallaAdministracionEtiquetas } from "../pantallas/administracion-etiquetas.js";
import { Modal } from "../componentes/todos.js";

let pagina = PantallaAdministracionEtiquetas(location.pathname, {
  usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[1];
tabla /* ! Tabla */
  .iniciar();

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
  // ! Se deben crear nuevos formularios porque el valor del DNI del elegido estará en el indice, en el endpoint, y en más lógica dentro del manipulador de respuesta.
  if (etiquetaElegida.activado) {
    // * Se desea desbloquear
    modal.titulo = "Deshabilitar " + etiquetaElegida.descripcion;
    modal.contenido = [
      // TODO Feature: Mostrar razón del desbloqueo, preguntar si se está seguro.
      new ComponenteLiteral(
        () => `<big><b><p>¿Estás seguro?</p></b></big><br/>`
      ),
      new Formulario(
        "administracion-etiquetas-deshabilitar",
        `/api/etiquetas/${ID}/activado`,
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
            // TODO UX: Mejores alertas
            alert(`Error ${info.codigo}: ${txt}`);
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
        `/api/etiquetas/${ID}/activado`,
        [],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indiceEtiquetaElegida].ID == ID) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = true;

              tabla.entidades[indiceEtiquetaElegida].activado = false;
            }
          } else {
            checkbox.checked = false;
            // TODO UX: Mejores alertas
            alert(`Error ${info.codigo}: ${txt}`);
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

  modal.titulo = "Editar a " + etiquetaElegida.descripcion;
  modal.contenido = [
    new Formulario(
      "administracion-etiquetas-editar",
      `/api/etiquetas/${ID}`,
      [
        {
          name: "descripcion",
          textoEtiqueta: "Descripción",
          type: "text",
          value: etiquetaElegida.descripcion,
        },
        {
          name: "categoriaID",
          textoEtiqueta: "Categoría:",
          type: "select",
        },
      ],
      (txt, info) => {
        if (info.ok) {
          if (tabla.entidades[indiceEtiquetaElegida].ID == ID) {
            // * Si se sigue en la misma página
            // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
            //TODO: cambiar los datos
            let tab = document.getElementById("administrar-etiquetas");
            console.log(JSON.parse(txt).categoria.descripcion);
            tab.rows[
              indiceEtiquetaElegida + 1
            ].cells[1].innerHTML = `<div class="categoria" style="background-color: ${
              JSON.parse(txt).categoria.color
            }"><div class="descripcion">${JSON.parse(txt).categoria.descripcion}</div></div>`;
            tab.rows[indiceEtiquetaElegida + 1].cells[0].innerText =
              JSON.parse(txt).descripcion;
            etiquetaElegida.descripcion = JSON.parse(txt).descripcion;
            etiquetaElegida.categoria = JSON.parse(txt).categoria;
          }
        } else {
          // TODO UX: Mejores alertas
          alert(`Error ${info.codigo}: ${txt}`);
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

  fetch("/api/categorias").then((options) => {
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
  });

  modalElemento.classList.add("is-active");
};
//TODO AGREGAR

/*
gEt("botonAgregar").onclick = (e) => {
  modal.titulo = "Agregar Categoría";
  modal.contenido = [
    new Formulario(
      "administracion-categorias-agregar",
      `/api/categorias`,
      [
        {
          name: "descripcion",
          textoEtiqueta: "Descripción",
          type: "text",
        },
        {
          name: "color",
          textoEtiqueta: "Color:",
          type: "color",
        },
      ],
      (txt, info) => {
        if (info.ok) {
          // * Si se sigue en la misma página
          // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
          //TODO: cambiar los datos
          window.location.reload();
        } else {
          // TODO UX: Mejores alertas
          alert(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "POST",
        textoEnviar: "Agregar Categoría",
        clasesBoton: "is-link is-rounded mt-3",
      }
    ),
  ];

  modal.redibujar();

  modalElemento.classList.add("is-active");
};
*/
