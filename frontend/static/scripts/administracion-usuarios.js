import { gEt, SqS } from "../libs/c3tools.js";
import { Titulo, Formulario, ComponenteLiteral } from "../componentes/todos.js";
import { PantallaAdministracionUsuarios } from "../pantallas/administracion-usuarios.js";
import { Modal } from "../componentes/todos.js";

let pagina = PantallaAdministracionUsuarios(location.pathname, {
  usuario: window.usuarioActual,
}, location.search.split('=')[1]);
let modal = pagina.partes[0];
let tabla = pagina.partes[2];
tabla /* ! Tabla */
  .iniciar();

let modalElemento = gEt("modal-eliminar-usuario");
modalElemento.addEventListener("submit", () => {
  modalElemento.classList.remove("is-active");
});

// TODO Feature: Que al volver para atrás (por historial) se mantenga la paginación. localStorage? dejar que el caché de chrome se encargue?

gEt("administrar-usuarios").onclick = (e) => {
  let boton = e.target;
  if (boton.type != "button") {
    return;
  }

  let DNI = boton.id.split("-")[2];

  let indiceUsuarioElegido = tabla.entidades.findIndex(
    ({ DNI: esteID }) => esteID == DNI
  );
  let usuarioElegido = tabla.entidades[indiceUsuarioElegido];

  modal.titulo = "Editar a " + usuarioElegido.nombre;
  modal.contenido = [
    new Formulario(
      "administracion-usuarios-editar",
      `/api/usuario/${DNI}`,
      [
        {
          name: "nombre",
          textoEtiqueta: "Nombre:",
          type: "text",
          value: usuarioElegido.nombre,
        },
        {
          name: "correo",
          textoEtiqueta: "Correo: ",
          type: "email",
          value: usuarioElegido.correo,
        },
        {
          name: "perfilID",
          textoEtiqueta: "Perfil",
          type: "select",
        },
      ],
      (txt, info) => {
        if (info.ok) {
          
           window.location.reload();

        } else {
          Swal.error(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "PATCH",
        textoEnviar: "Editar usuario",
        clasesBoton: "is-link is-rounded mt-3",
      }
    ),
  ];

  modal.redibujar();

  let select = document.getElementsByName("perfilID")[0];

  fetch("/api/perfil?todos=1").then((options) => {
    options.json().then((options) => {
      options.forEach((option) => {
        var o = document.createElement("option");
        o.text = option.nombre;
        o.value = option.ID;
        if(usuarioElegido.perfil)
            if (option.ID == usuarioElegido.perfil.ID) {
            o.selected = true;
            }
        select.add(o);
      });
    });
  });

  modalElemento.classList.add("is-active");
};


gEt("botonAgregar").onclick = (e) => {
    modal.titulo = "Agregar Usuario";
    modal.contenido = [
      new Formulario(
        "administracion-usuarios-agregar",
        `/api/usuario`,
        [
            {
                name: "nombre",
                textoEtiqueta: "Nombre:",
                type: "text",
              },
            {
              name: "DNI",
              textoEtiqueta: "D.N.I:",
              type: "text",
            },
            {
                name: "correo",
                textoEtiqueta: "Correo: ",
                type: "email",
              },
            {
                name: "contrasenia",
                textoEtiqueta: "Contraseña:",
                type: "password",
              },
            {
              name: "perfilID",
              textoEtiqueta: "Perfil",
              type: "select",
            },
          ],
        (txt, info) => {
          if (info.ok) {
            // * Si se sigue en la misma página
            // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
            //TODO: cambiar los datos
            window.location.reload();
          } else {
            Swal.error(`Error ${info.codigo}: ${txt}`);
          }
        },
        {
          verbo: "POST",
          textoEnviar: "Agregar usuario",
          clasesBoton: "is-link is-rounded mt-3",
        }
      ),
    ];
  
    modal.redibujar();
  
    let select = document.getElementsByName("perfilID")[0];

  fetch("/api/perfil?todos=1").then((options) => {
    options.json().then((options) => {
      options.forEach((option) => {
        var o = document.createElement("option");
        o.text = option.nombre;
        o.value = option.ID;
        select.add(o);
      });
    });
});
  
    modalElemento.classList.add("is-active");
  };
  
gEt("administrar-usuarios").onchange = (e) => {
    let checkbox = e.target;
    if (checkbox.type != "checkbox") {
      return;
    }
  
    // TODO UX: Deshacer el cambio si se sale del modal. Esto no se puede implementar rápido porque el handler de cerrado está en pagina, no en modal.
    checkbox.checked = !checkbox.checked;
  
    let DNI = checkbox.value;
  
    let indiceUsuarioElegido = tabla.entidades.findIndex(
      ({ DNI: esteDNI }) => esteDNI == DNI
    );
    let usuarioElegido = tabla.entidades[indiceUsuarioElegido];
  
    // TODO Refactor: Aplicar DRY a lo que se pueda.
    // ! Se deben crear nuevos formularios porque el valor del DNI del elegido estará en el indice, en el endpoint, y en más lógica dentro del manipulador de respuesta.
    if (usuarioElegido.bloqueosRecibidos.length) {
      // * Se desea desbloquear
      modal.titulo = "Desbloquear a " + usuarioElegido.nombre;
      modal.contenido = [
        // TODO Feature: Mostrar razón del desbloqueo, preguntar si se está seguro.
        new ComponenteLiteral(
          () =>
            `<big><b><p>¿Estás seguro?</p></b></big> <p><i>${usuarioElegido.nombre} fue bloqueado con el siguiente motivo:</i><br/>${usuarioElegido.bloqueosRecibidos[0].motivo}</p><br/>`
        ),
        new Formulario(
          "moderacion-usuarios-desbloquear",
          `/api/usuario/${DNI}/bloqueo`,
          [
            {
              name: "motivo",
              textoEtiqueta: "Motivo del desbloqueo:",
              type: "textarea",
            },
          ],
          (txt, info) => {
            if (info.ok) {
              if (tabla.entidades[indiceUsuarioElegido].DNI == DNI) {
                // * Si se sigue en la misma página
                // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
                checkbox.checked = false;
  
                tabla.entidades[indiceUsuarioElegido].bloqueosRecibidos = [];
              }
            } else {
              checkbox.checked = true;
              Swal.error(`Error ${info.codigo}: ${txt}`);
            }
  
            checkbox.disabled = false;
          },
          {
            verbo: "DELETE",
            textoEnviar: "Registrar motivo y desbloquear",
            clasesBoton: "is-link is-rounded mt-3",
            alEnviar: () => (checkbox.disabled = true),
          }
        ),
      ];
    } else {
      // * Se desea bloquear
      modal.titulo = "Bloquear a " + usuarioElegido.nombre;
      modal.contenido = [
        new Formulario(
          "moderacion-usuarios-desbloquear",
          `/api/usuario/${DNI}/bloqueo`,
          [
            {
              name: "motivo",
              textoEtiqueta: "Motivo del bloqueo:",
              type: "textarea",
            },
          ],
          (txt, info) => {
            if (info.ok) {
              if (tabla.entidades[indiceUsuarioElegido].DNI == DNI) {
                // * Si se sigue en la misma página
                // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
                checkbox.checked = true;
  
                tabla.entidades[indiceUsuarioElegido].bloqueosRecibidos = [
                  {
                    motivo: SqS(
                      '#moderacion-usuarios-desbloquear [name="motivo"]'
                    ).value,
                  },
                ];
              }
            } else {
              checkbox.checked = false;
              Swal.error(`Error ${info.codigo}: ${txt}`);
            }
  
            checkbox.disabled = false;
          },
          {
            verbo: "POST",
            textoEnviar: "Registrar motivo y bloquear",
            clasesBoton: "is-link is-rounded mt-3",
            alEnviar: () => (checkbox.disabled = true),
          }
        ),
      ];
    }
  
    modal.redibujar();
    modalElemento.classList.add("is-active");
  };
  