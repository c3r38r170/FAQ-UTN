import {
  Pagina,
  Titulo,
  Formulario,
  Tabla,
  Boton,
  Fecha,
  ChipUsuario,
  Modal,
} from "../componentes/todos.js";

function crearPantalla(ruta, sesion) {
  let tabla = new Tabla("administrar-etiquetas", "/api/etiqueta", [
    {
      nombre: "Etiqueta",
      celda: (etiqueta) => etiqueta.descripcion,
    },
    {
      nombre: "Categoría",
      celda: (etiqueta) =>
        `<div class="categoria" style="background-color: ${etiqueta.categoria.color}">${etiqueta.categoria.descripcion}</div>`,
    },
    {
      nombre: "Editar",
      clases: ["centrado"],
      celda: (etiqueta) =>
        `<button class="button is-link is-small is-rounded" id="boton-editar-${etiqueta.ID}" type="button">
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
  let pagina = new Pagina({
    ruta: ruta,
    titulo: "Administracion - Etiquetas",
    sesion: sesion,
    partes: [
      new Modal("Eliminar Categoría", "modal-eliminar-etiqueta"),
      tabla,
      new Boton({
        titulo: "Agregar",
        classes: "is-link is-rounded mt-3",
        dataTarget: "modal-agregar-etiqueta",
        type: "button",
        id: "botonAgregar",
      }),
    ],
  });
  return pagina;
}
export { crearPantalla as PantallaAdministracionEtiquetas };
