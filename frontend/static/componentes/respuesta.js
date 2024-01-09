import { ChipUsuario } from "./chipusuario.js";
import { ChipValoracion } from "./chipvaloracion.js"

class Respuesta {
  #valoracion;
  #estado = {
    estado: false
  };
  #cuerpo;
  #fecha;
  #usuario;
  #chipusuario;
  etiquetas = [];
  constructor({ usuario, cuerpo, fecha, valoracion }) {
    this.#usuario = usuario;
    this.#valoracion = valoracion;
    this.#cuerpo = cuerpo;
    this.#fecha = fecha;
    this.#chipusuario = new ChipUsuario(usuario);
  }
  render() {
    return `
        <div id="respuesta">
            <div class="valoracion is narrow">
                ${new ChipValoracion(this.#valoracion, this.#estado).render()}
            </div>
            <div class="cuerpo">
                ${this.#cuerpo}
                <div class="columns is-vcentered mb-1 usuario">
                    <div class="column is-narrow pr-0 py-0">
                    ${this.#chipusuario.render()}
                    </div>
                    <div class="column is-narrow pl-0 py-0">
                        <div id="fecha">  •  ${this.#fecha}</div>
                    </div>
                </div>
            </div>
        </div>
        `;
  }
}

export { Respuesta };
