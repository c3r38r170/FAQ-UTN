import {
  Pagina,
  Titulo,
  Formulario,
  Tabla,
  Boton,
  Fecha,
  ChipUsuario,
  Modal,
  ComponenteLiteral
} from "../componentes/todos.js";

function crearPantalla(ruta, sesion) {

  //simula fetch
  let cantidadEtiquetas =11;

  let tabla = new Tabla("administrar-etiquetas", "/api/etiqueta", [
    {
      nombre: "Etiqueta",
      celda: (etiqueta) => etiqueta.descripcion,
    },
    {
      nombre: "Categoría",
      clases: ["centrado"],
      celda: (etiqueta) =>
        `<div class="categoria" style="background-color: ${etiqueta.categoria.color}"><div class="descripcion">${etiqueta.categoria.descripcion}</div></div>`,
    },
    {
      nombre: "Editar",
      clases: ["centrado"],
      celda: (etiqueta) =>
        `<button class="button is-link is-small" id="boton-editar-${etiqueta.ID}" type="button">
          Editar
        </button>`,
    },
    {
      nombre: "Habilitado",
      clases: ["centrado"],
      celda: (etiqueta) =>
        `<div class="field"><input type="checkbox" value="${
          etiqueta.ID
        }" id="desactivar-${etiqueta.ID}" class="switch" ${
          etiqueta.activado ? "checked" : ""
        }><label for="desactivar-${etiqueta.ID}"></label></div>`,
    },
  ]);
  let contenedor1 = new ComponenteLiteral(()=> `<div class="contenedor-tabla">`)
  let contenedor2 = new ComponenteLiteral(()=> `</div>`)
  let pagina = new Pagina({
    ruta: ruta,
    titulo: "Administracion - Etiquetas",
    sesion: sesion,
    partes: [
      new Modal("Eliminar Categoría", "modal-eliminar-etiqueta"),
      contenedor1,
      tabla,
      contenedor2,
      new Boton({
        titulo: "Agregar",
        classes: "button is-link is-small is-rounded botonAgregar",
        dataTarget: "modal-agregar-etiqueta",
        type: "button",
        id: "botonAgregar",
      }),
    ],
  });
  return pagina;
}
export { crearPantalla as PantallaAdministracionEtiquetas };
