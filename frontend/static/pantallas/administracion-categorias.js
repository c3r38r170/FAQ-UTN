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
  let tabla = new Tabla("administrar-categorias", "/api/categorias", [
    {
      nombre: "Categoria",
      celda: (categoria) =>
        `<div class="categoria" style="background-color: ${categoria.color}"><div class="descripcion">${categoria.descripcion}</div></div>`,
    },
    {
      nombre: "Editar",
      clases: ["centrado"],
      celda: (categoria) =>
        `<button class="button is-link is-small is-rounded" id="boton-editar-${categoria.ID}" type="button">
        Editar
      </button>`,
    },
    {
      nombre: "Habilitado",
      clases: ["centrado"],
      celda: (categoria) =>
        `<div class="field"><input type="checkbox" value="${
          categoria.ID
        }" id="desactivar-${categoria.ID}" class="switch" ${
          categoria.activado ? "checked" : ""
        }><label for="desactivar-${categoria.ID}"></label></div>`,
    },
  ]);
  let pagina = new Pagina({
    ruta: ruta,
    titulo: "Administracion - Categorías",
    sesion: sesion,
    partes: [
      new Modal("Eliminar Categoría", "modal-eliminar-categoria"),
      tabla,
      new Boton({
        titulo: "Agregar",
        classes: "is-link is-rounded mt-3",
        dataTarget: "modal-agregar-perfil",
        type: "button",
        id: "botonAgregar",
      }),
    ],
  });
  return pagina;
}
export { crearPantalla as PantallaAdministracionCategorias };
