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
  let tabla = new Tabla("administrar-perfiles", "/api/perfil", [
    {
      nombre: "Perfil",
      celda: (perfil) =>
        `<div class="perfil" style="background-color: ${perfil.color}"><div class="descripcion">${perfil.descripcion}</div></div>`,
    },
    {
      nombre: "Nivel",
      clases: ["centrado"],
      celda: (perfil) =>
        perfil.permiso.ID == 1
          ? "Usuario"
          : perfil.permiso.ID == 2
            ? "Moderación"
            : "Administración",
    },
    {
      nombre: "Editar",
      clases: ["centrado"],
      celda: (perfil) =>
        `<button class="button is-link is-small" id="boton-editar-${perfil.ID}" type="button">
      Editar
    </button>`,
    },
    {
      nombre: "Habilitado",
      clases: ["centrado"],
      celda: (perfil) =>
        `<div class="field"><input type="checkbox" value="${perfil.ID
        }" id="desactivar-${perfil.ID}" class="switch" ${perfil.activado ? "checked" : ""
        }><label for="desactivar-${perfil.ID}"></label></div>`,
    },
  ]);
  let contenedor1 = new ComponenteLiteral(()=> `<div class="contenedor-tabla">`)
	let contenedor2 = new ComponenteLiteral(()=> `</div>`)
  let pagina = new Pagina({
    ruta: ruta,
    titulo: "Administracion - Perfiles",
    sesion: sesion,
    partes: [
      new Modal("Eliminar Perfil", "modal-eliminar-perfil"),
      contenedor1,
      tabla,
      contenedor2,
      new Boton({
        titulo: "Agregar",
        classes: "button is-link is-small botonAgregar",
        dataTarget: "modal-agregar-perfil",
        type: "button",
        id: "botonAgregar",
      }),
    ],
  });
  return pagina;
}

export { crearPantalla as PantallaAdministracionPerfiles };
