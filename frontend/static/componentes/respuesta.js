import { ChipUsuario } from "./chipusuario.js";
import { ChipValoracion } from "./chipvaloracion.js";
import { Fecha } from "./fecha.js";
import { BotonReporte } from "./botonReporte.js";

class Respuesta {
  #ID;
  #valoracion = {
    ID: this.#ID,
    votos: [],
    usuarioActual:null
  }
  #cuerpo;
  #fecha;
  #usuario;
  etiquetas = [];
  #instanciaModal;
  #chipValoracion;
  constructor({ ID, cuerpo, fecha, post},instanciaModal,usuarioActual) {
    this.#ID = ID;
    this.#valoracion.ID = ID;
    this.#valoracion.usuarioActual=usuarioActual;
    this.#valoracion.votos=post.votos;
    this.#cuerpo = cuerpo;
    this.#fecha = new Fecha(fecha);
    this.#usuario = post.duenio;
    this.#instanciaModal = instanciaModal;
    this.#chipValoracion = new ChipValoracion(this.#valoracion);

  }



  render() {
    return `
        <div id="respuesta">
              ${this.#chipValoracion.render()}
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
