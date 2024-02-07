import { ChipUsuario } from "./chipusuario.js";
import { Etiqueta } from "./etiqueta.js";
import { Respuesta } from "./respuesta.js";
import { Boton } from "./boton.js";
import { Fecha } from "./fecha.js"
import { BotonReporte } from "./botonReporte.js";

class Pregunta{
    #ID;
    #titulo;
    #cuerpo;
    #fecha;
    #usuario;
    #etiquetas= []
    #respuestas= []
    #instanciaModal;
    #usuarioActual;
    #respuestasCount;
    // TODO Feature: Hay 2 representaciones de pregunta. En el inicio, donde hay un listado, se ve la pregunta y la primera respuesta; y en la página propia se ve solo la pregunta y las respuestas se verían abajo con su propia representación.

	constructor({ID, titulo, cuerpo, fecha, post, respuestas, etiquetas, respuestasCount},instanciaModal, usuarioActual){

        // TODO Feature: Pensar condiciones de fallo de creación. Considerar que puede venir sin cuerpo (formato corto) o sin título (/pregunta, quitado "artificialmente")
        // if (titulo && cuerpo && fecha) {
            this.#titulo = titulo;
            this.#cuerpo = cuerpo;
            this.#fecha = new Fecha(fecha)
            this.#usuario = post.duenio;
            this.#respuestas = respuestas;
            this.#respuestasCount = respuestasCount;
            this.#ID = ID;

            this.#etiquetas = etiquetas;
            this.#instanciaModal = instanciaModal;
            this.#usuarioActual=usuarioActual;

            
        // }
        // TODO Feature: fallar en el else
	}

	render(){
        return`
            <div class="pregunta">
                <div class="encabezado">
                    ${new ChipUsuario(this.#usuario).render()}
                    <div class="pl-0 py-0">
                        ${this.#fecha.render()}
                    </div>
                    ${ new BotonReporte(this.#ID, this.#instanciaModal).render() }
                </div>

                <a href="/pregunta/${this.#ID}">
                    <div id="titulo">${this.#titulo}</div>

                </a>
                <div class="cuerpo">${this.#cuerpo}</div>
                <div class="etiquetas">
                ${this.#etiquetas ? this.#etiquetas.map(e=>new Etiqueta(e.etiquetum).render()).join('') : ''}
                </div>
                <div class="cantRespuestas">${this.#respuestasCount > 0 ? this.#respuestasCount + ' Respuestas' : ''}</div>
                ${ this.#respuestas ? this.#respuestas.map((r) => new Respuesta(r,this.#instanciaModal,this.#usuarioActual ).render()).join("") : ''}
            </div>

            `;

    }
        

}

export {Pregunta};