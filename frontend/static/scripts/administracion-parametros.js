import { PantallaAdministracionParametros } from "../pantallas/administracion-parametros.js";
import { gEt, SqS } from "../libs/c3tools.js";

let pagina = PantallaAdministracionParametros(
  location.pathname,
  { usuario: window.usuarioActual },
  window.parametros
);
let modal = pagina.partes[0];
let tabla = pagina.partes[1];
tabla /* ! Tabla */
  .iniciar();

let modalElemento = gEt("modal-editar-parametros");
modalElemento.addEventListener("submit", () => {
  modalElemento.classList.remove("is-active");
});

// TODO Feature: Que al volver para atrás (por historial) se mantenga la paginación. localStorage? dejar que el caché de chrome se encargue?

gEt("administrar-parametros").onclick = (e) => {
  let boton = e.target;
  if (boton.type != "button") {
    return;
  }

  let ID = boton.id.split("-")[2];

  let indiceParametroElegido = tabla.entidades.findIndex(
    ({ ID: esteID }) => esteID == ID
  );
  let parametroElegido = tabla.entidades[indiceParametroElegido];

  modal.titulo = "Editar " + parametroElegido.descripcion;
  modal.contenido = [
    new Formulario(
      "administracion-parametros-editar",
      `/api/parametros/${ID}`,
      [
        {
          name: "valor",
          textoEtiqueta: "Valor:",
          type: "text",
          value: parametroElegido.valor,
        },
      ],
      (txt, info) => {
        if (info.ok) {
          if (tabla.entidades[indiceParametroElegido].ID == ID) {
            // * Si se sigue en la misma página
            // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
            //TODO: cambiar los datos
            let tab = document.getElementById("administrar-parametros");
            tab.rows[indiceParametroElegido + 1].cells[1].innerText =
              JSON.parse(txt).valor;
            parametroElegido.valor = JSON.parse(txt).valor;
          }
        } else {
          // TODO UX: Mejores alertas
          alert(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "PATCH",
        textoEnviar: "Editar parametro",
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
