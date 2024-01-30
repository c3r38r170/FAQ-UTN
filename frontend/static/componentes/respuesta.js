import { ChipUsuario } from "./chipusuario.js";
import { ChipValoracion } from "./chipvaloracion.js"
import { Fecha } from "./fecha.js"
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
  constructor({ ID, cuerpo, fecha, post }) {
    this.#ID = ID;
    this.#cuerpo = cuerpo;
    this.#fecha = new Fecha(fecha);
    this.#usuario = post.duenio;
  }
  render() {
    return `
        <div id="respuesta">
              ${new ChipValoracion(this.#valoracion).render()}
              <div class="cuerpo">
                <div id="contenedor-reporte">
                  ${ new BotonReporte({idPost: this.#ID}).render()}
                </div>
                ${this.#cuerpo}
                <div class="columns is-vcentered mb-1 usuario">
                    <div class="column is-narrow pr-0 py-0">
                    ${new ChipUsuario(this.#usuario).render()}
                    </div>
                    <div class="column pl-0 py-0">
                        ${this.#fecha.render()}
                    </div>
                    
                </div>
            </div>
        </div>
        `;
  }


}

export { Respuesta };
