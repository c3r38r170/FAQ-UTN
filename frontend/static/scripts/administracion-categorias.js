import { gEt } from "../libs/c3tools.js";
import { Formulario, ComponenteLiteral } from "../componentes/todos.js";
import { PantallaAdministracionCategorias } from "../pantallas/administracion-categorias.js";

let pagina = PantallaAdministracionCategorias(location.pathname, {
  usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[1];
tabla.iniciar();

let modalElemento = gEt("modal-eliminar-categoria");
modalElemento.addEventListener("submit", () => {
  modalElemento.classList.remove("is-active");
});

// TODO Feature: Que al volver para atrás (por historial) se mantenga la paginación. localStorage? dejar que el caché de chrome se encargue?
gEt("administrar-categorias").onchange = (e) => {
  let checkbox = e.target;
  if (checkbox.type != "checkbox") {
    return;
  }

  // TODO UX: Deshacer el cambio si se sale del modal. Esto no se puede implementar rápido porque el handler de cerrado está en pagina, no en modal.
  checkbox.checked = !checkbox.checked;

  let ID = checkbox.value;

  let indiceCategoriaElegida = tabla.entidades.findIndex(
    ({ ID: esteID }) => esteID == ID
  );
  let categoriaElegida = tabla.entidades[indiceCategoriaElegida];

  // TODO Refactor: Tratar de mantener activado o habilitado, a menos que esta sea realmente la mejor solución.
  // TODO Refactor: Aplicar DRY a lo que se pueda.
  // ! Se deben crear nuevos formularios porque el valor del ID de la categoría elegida estará en el indice, en el endpoint, y en más lógica dentro del manipulador de respuesta.
  if (categoriaElegida.activado) {
    // * Se desea desactivar / deshabilitar
    modal.titulo = "Deshabilitar " + categoriaElegida.descripcion;
    modal.contenido = [
      new ComponenteLiteral(
        () => `<big><b><p>¿Estás seguro?</p></b></big><br/>`
      ),
      new Formulario(
        "administracion-categorias-deshabilitar",
        `/api/categoria/${ID}/activado`,
        [],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indiceCategoriaElegida].ID == ID) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = false;

              tabla.entidades[indiceCategoriaElegida].activado = false;
            }
          } else {
            checkbox.checked = true;
            Swal.error(`Error ${info.codigo}: ${txt}`);
          }

          checkbox.disabled = false;
        },
        {
          verbo: "PATCH",
          textoEnviar: "Deshabilitar categoria",
          clasesBoton: "is-link is-rounded mt-3",
          // TODO Refactor: DRY
          alEnviar: () => (checkbox.disabled = true),
        }
      ),
    ];
  } else {
    // * Se desea activar / habilitar
    modal.titulo = "Habilitar a " + categoriaElegida.descripcion;
    modal.contenido = [
      new Formulario(
        "administracion-categoria-deshabilitar",
        `/api/categoria/${ID}/activado`,
        [],
        (txt, info) => {
          if (info.ok) {
            if (tabla.entidades[indiceCategoriaElegida].ID == ID) {
              // * Si se sigue en la misma página
              // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
              checkbox.checked = true;

              tabla.entidades[indiceCategoriaElegida].activado = true;
            }
          } else {
            checkbox.checked = false;
            Swal.error(`Error ${info.codigo}: ${txt}`);
          }

          checkbox.disabled = false;
        },
        {
          verbo: "PATCH",
          textoEnviar: "Habilitar categoria",
          clasesBoton: "is-link is-rounded mt-3",
          alEnviar: () => (checkbox.disabled = true),
        }
      ),
    ];
  }

  modal.redibujar();
  modalElemento.classList.add("is-active");
};

gEt("administrar-categorias").onclick = (e) => {
  let boton = e.target;
  if (boton.type != "button") {
    return;
  }

  let ID = boton.id.split("-")[2];

  let indiceCategoriaElegida = tabla.entidades.findIndex(
    ({ ID: esteID }) => esteID == ID
  );
  let categoriaElegida = tabla.entidades[indiceCategoriaElegida];

  modal.titulo = "Editar a " + categoriaElegida.descripcion;
  modal.contenido = [
    new Formulario(
      "administracion-categorias-editar",
      `/api/categoria/${ID}`,
      [
        {
          name: "descripcion",
          textoEtiqueta: "Descripción",
          type: "text",
          value: categoriaElegida.descripcion,
        },
        {
          name: "color",
          textoEtiqueta: "Color:",
          type: "color",
          value: categoriaElegida.color,
        },
      ],
      (txt, info) => {
        if (info.ok) {
          if (tabla.entidades[indiceCategoriaElegida].ID == ID) {
            // * Si se sigue en la misma página
            // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
            //TODO Refactor: DRY
            let tab = document.getElementById("administrar-categorias");
            tab.rows[
              indiceCategoriaElegida + 1
            ].cells[0].innerHTML = `<div class="categoria" style="background-color: ${
              JSON.parse(txt).color
            }"><div class="descripcion">${JSON.parse(txt).descripcion}</div></div>`;
            categoriaElegida.descripcion = JSON.parse(txt).descripcion;
            categoriaElegida.color = JSON.parse(txt).color;
          }
        } else {
          checkbox.checked = true;
          Swal.error(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "PATCH",
        textoEnviar: "Editar categoria",
        clasesBoton: "is-link is-rounded mt-3",
      }
    ),
  ];

  modal.redibujar();

  modalElemento.classList.add("is-active");
};

gEt("botonAgregar").onclick = (e) => {
  modal.titulo = "Agregar Categoría";
  modal.contenido = [
    new Formulario(
      "administracion-categorias-agregar",
      `/api/categoria`,
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
          //TODO UX: Mantener filtros, página...
          window.location.reload();
        } else {
          Swal.error(`Error ${info.codigo}: ${txt}`);
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
