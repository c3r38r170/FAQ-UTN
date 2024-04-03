import { Fecha } from "./fecha.js";

// TODO Refactor: Propiedades como CORTO o LARGO de fecha, pero para si es completo o simple (u otro par de adjetivos)
class ChipUsuario {
  #DNI;
  #nombreusuario;
  #correo;
  #createdAt;
  #esPerfil;
  #tipo;
  #color;
  #propio;
  #carreras;

  constructor(
    { DNI, nombre, correo, createdAt, fecha_alta, perfil, carreras },
    esPerfil = false, propio = false
  ) {
    this.#DNI = DNI;
    this.#nombreusuario = nombre;
    this.#correo = correo;
    this.#createdAt = new Fecha(fecha_alta || createdAt);
    this.#esPerfil = esPerfil;
    this.#tipo = perfil ? perfil.descripcion : "Usuario";
    this.#color = perfil ? perfil.color : "#485fc7";
    this.#propio = propio;
    this.#carreras = carreras
  }
  render() {
    if (this.#esPerfil) {
      return `
            <div class="chip-usuario-perfil">
                ${this.#propio ? `
                  <div id="contenedorImagen">
                    <input class="mr-3 img-usuario"  id="fotoPerfil" type="image" src="/api/usuario/${this.#DNI}/foto"></input>
                    <div id="cambiarFoto">
                      Editar
                    </div>
                  </div>
                    `:
          '<img class="mr-3 img-usuario" src="/api/usuario/' + this.#DNI + '/foto" ></img>'}
                <div class="contenido-perfil">
                    <div>DNI: <span>${this.#DNI}</span></div>
                    <div>Nombre: <span>${this.#nombreusuario}</span></div>
                    <div>Correo electrónico: <span>${this.#correo}</span> ${this.#propio ? '<button id="botonCambiarMail" type="button" class="button is-link is-small is-rounded">Modificar</button>' : ''}  </div>
                    <div>Miembro desde: ${this.#createdAt.render()}</div>
                    <div>${this.#carreras.length > 0 ? "Estudiante de:" + this.#carreras.map(c => { return " " + c.nombre }) : ""}</div>
                    <div class="tipo-usuario" style="background-color: ${this.#color
        }"><div class="descripcion">${this.#tipo}</div></div>
                </div>
            </div>
            `;
    } else {
      return `
        <div class="chip-usuario is-vcentered">
          <a href="/perfil/${this.#DNI}" class="contenedor-img">
          <img class="mr-3 img-usuario" src="/api/usuario/${this.#DNI}/foto" ></img>
          </a>
          <a class="nombre-usuario" href="/perfil/${this.#DNI}">${this.#nombreusuario}</a>
          <div class="tipo-usuario" style="background-color: ${this.#color}">
            <div class="descripcion">${this.#tipo}</div>
          </div>
        </div>
            `;
    }
  }
}

export { ChipUsuario };
