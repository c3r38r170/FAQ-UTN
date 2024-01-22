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
  #chipusuario;
  etiquetas = [];
  constructor({ ID, usuario, cuerpo, fecha, valoracion }) {
    this.#ID = ID;
    this.#valoracion = valoracion;
    this.#cuerpo = cuerpo;
    this.#fecha = new Fecha(fecha);
    this.#chipusuario = new ChipUsuario(usuario);
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
                    ${this.#chipusuario.render()}
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
