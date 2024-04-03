import { Pagina, Formulario, Modal, Tabla, ComponenteLiteral } from "../componentes/todos.js";

//TODO: Feature: cambiar campos por apropiados y validar
//TODO: Feature: permisos
function crearPantalla(ruta, sesion, p) {
  let tabla = new Tabla("administrar-parametros", "/api/parametro", [
    {
      nombre: "Parametros",
      celda: (parametro) => parametro.descripcion,
    },
    {
      nombre: "Valor",
      clases: ["centrado"],
      celda: (parametro) => parametro.ID == 2 ? parametro.valor == 1 ? "Sí" : "No" : parametro.valor,
    },
    {
      nombre: "Editar",
      clases: ["centrado"],
      celda: (parametro) =>
        `<button class="button is-link is-small" id="boton-editar-${parametro.ID}" type="button">
          Editar
        </button>`,
    },
  ], [], 1, false);
  let contenedor1 = new ComponenteLiteral(() => `<div class="contenedor-tabla">`)
  let contenedor2 = new ComponenteLiteral(() => `</div>`)
  let pagina = new Pagina({
    ruta: ruta,
    titulo: "Administracion - Parametros",
    sesion: sesion,
    partes: [
      new Modal("editar Parametros", "modal-editar-parametros"),
      contenedor1,
      tabla,
      contenedor2
    ],
  });
  return pagina;
}

export { crearPantalla as PantallaAdministracionParametros };
