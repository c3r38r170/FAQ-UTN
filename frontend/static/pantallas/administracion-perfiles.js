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
  let tabla = new Tabla("administrar-perfiles", "/api/perfiles", [
    {
      nombre: "Perfil",
      celda: (perfil) =>
        `<div class="perfil" style="background-color: ${perfil.color}"><div class="descripcion">${perfil.nombre}</div></div>`,
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
        `<button class="button is-link is-small is-rounded" id="boton-editar-${perfil.ID}" type="button">
      Editar
    </button>`,
    },
    {
      nombre: "Habilitado",
      clases: ["centrado"],
      celda: (perfil) =>
        `<div class="field"><input type="checkbox" value="${
          perfil.ID
        }" id="desactivar-${perfil.ID}" class="switch" ${
          perfil.activado ? "checked" : ""
        }><label for="desactivar-${perfil.ID}"></label></div>`,
    },
  ]);
  let pagina = new Pagina({
    ruta: ruta,
    titulo: "Administracion - Perfiles",
    sesion: sesion,
    partes: [
      new Modal("Eliminar Perfil", "modal-eliminar-perfil"),
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

export { crearPantalla as PantallaAdministracionPerfiles };
