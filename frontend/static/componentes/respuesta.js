import { ChipUsuario } from "./chipusuario.js";
import { ChipValoracion } from "./chipvaloracion.js"

class Respuesta {
  #valoracion = {
    valoracion: '40',
    estado: false
  }
  #cuerpo;
  #fecha;
  #chipusuario;
  etiquetas = [];
  constructor({ usuario, cuerpo, fecha, valoracion }) {
    this.#valoracion = valoracion;
    this.#cuerpo = cuerpo;
    this.#fecha = fecha;
    this.#chipusuario = new ChipUsuario(usuario);
  }
  render() {
    return `
        <div id="respuesta">
              ${new ChipValoracion(this.#valoracion).render()}
              <div class="cuerpo">
                <div id="contenedor-reporte">
                  <button id="reporte" onclick="${this.reportar()}">
                  <span>
                      <i class="fa-solid fa-circle-exclamation">
                      </i>
                  </span>
                  </button>
                </div>
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

  reportar(){

  }

}

export { Respuesta };
