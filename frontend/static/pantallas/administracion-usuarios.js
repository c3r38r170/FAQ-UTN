import {
    Pagina,
    Titulo,
    Formulario,
    Tabla,
    Boton,
    Fecha,
    ChipUsuario,
    Modal,
    Busqueda
  } from "../componentes/todos.js";
  //La primer pagina tiene un usuario menos ¿?
  function crearPantalla(ruta, sesion, query="") {
    let tabla = new Tabla("administrar-usuarios", "/api/usuario?searchInput="+query, [
      {
        nombre: "DNI",
        celda: (usuario) =>
          usuario.DNI,
      },
      {
        nombre: "Nombre",
        celda: (usuario) =>
         usuario.nombre
      },
      {
        nombre: "Perfil",
        clases: ["centrado"],
        celda: (usuario) =>
        `<div class="perfil" style="background-color: ${usuario.perfil ? usuario.perfil.color : "#485fc7"}"><div class="descripcion">${usuario.perfil?usuario.perfil.nombre : "Usuario"}</div></div>`,
      },
      {
        nombre: "Editar",
        clases: ["centrado"],
        celda: (usuario) =>
          `<button class="button is-link is-small is-rounded" id="boton-editar-${usuario.DNI}" type="button">
        Editar
      </button>`,
      },
      {
        nombre:'Bloqueado',
        clases:['centrado'],
        celda:(usu)=>`<div class="field"><input type="checkbox" value="${usu.DNI}" id="bloqueo-${usu.DNI}" class="switch" ${usu.bloqueosRecibidos?.length?'checked':''}><label for="bloqueo-${usu.DNI}"></label></div>`
    }
    ]);
    let pagina = new Pagina({
      ruta: ruta,
      titulo: "Administracion - Usuarios",
      sesion: sesion,
      partes: [
        new Modal("Eliminar Usuario", "modal-eliminar-usuario"),
        new Busqueda(),
        tabla,
        new Boton({
          titulo: "Agregar",
          classes: "button is-link is-small is-rounded botonAgregar",
          dataTarget: "modal-agregar-usuario",
          type: "button",
          id: "botonAgregar",
        }),
      ],
    });
    return pagina;
  }
  
  export { crearPantalla as PantallaAdministracionUsuarios };
  