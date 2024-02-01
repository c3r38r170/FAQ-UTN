import { ChipUsuario } from "./chipusuario.js";
import { ChipValoracion } from "./chipvaloracion.js";
import { Fecha } from "./fecha.js";
import { BotonReporte } from "./botonReporte.js";

class Respuesta {
  #ID;
  #valoracion = {
    valoracion: '40',
    estado: false
  }
  #cuerpo;
  #fecha;
  #usuario;
  etiquetas = [];
  #instanciaModal;
  constructor({ ID, cuerpo, fecha, post },instanciaModal) {
    this.#ID = ID;
    this.#cuerpo = cuerpo;
    this.#fecha = new Fecha(fecha);
    this.#usuario = post.duenio;
    this.#instanciaModal = instanciaModal;
  }
  render() {
    return `
        <div id="respuesta">
              ${new ChipValoracion(this.#valoracion).render()}
              <div class="cuerpo">
                <div id="contenedor-reporte">
                  ${ new BotonReporte(this.#ID, this.#instanciaModal).render()}
                </div>
                ${this.#cuerpo}
                <div class="usuario">
                    ${new ChipUsuario(this.#usuario).render()}
                    ${this.#fecha.render()}
                </div>
            </div>
        </div>
        `;
  }


}

export { Respuesta };
