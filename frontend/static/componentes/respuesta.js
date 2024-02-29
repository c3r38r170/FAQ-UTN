import { ChipUsuario } from "./chipusuario.js";
import { ChipValoracion } from "./chipvaloracion.js";
import { Fecha } from "./fecha.js";
import { BotonReporte } from "./botonReporte.js";

class Respuesta {
  #ID;
  #valoracion = null;
  #cuerpo='';
  #fecha=null;
  #duenio=null;
  #usuarioActual=null;
  #instanciaModal=null;
  #chipValoracion=null;
  constructor({ ID, cuerpo, fecha, post},instanciaModal,sesion) {
    this.#ID = ID;
    this.#cuerpo = cuerpo;
    this.#fecha = new Fecha(fecha);
    this.#duenio = post.duenio;
    this.#instanciaModal = instanciaModal;
    this.#usuarioActual=sesion?.usuario;
    
    if(post.votos && sesion && this.#usuarioActual){
      this.#chipValoracion = new ChipValoracion({
        ID
        ,votos:post.votos
        ,usuarioActual: sesion
      });
    }
  }



  render() {
    return `
        <div class="respuesta">
              ${this.#chipValoracion?this.#chipValoracion.render():''}
              <div class="cuerpo">
                  ${(this.#instanciaModal && this.#usuarioActual)? '<div class="contenedor-reporte">'+new BotonReporte(this.#ID, this.#instanciaModal).render()+'</div>':''}
                ${this.#cuerpo.replace(/\n/g, '<br>')}
                <div class="usuario">
                    ${new ChipUsuario(this.#duenio).render()}
                    ${this.#fecha.render()}
                </div>
            </div>
        </div>
        `;
  }


}

export { Respuesta };
