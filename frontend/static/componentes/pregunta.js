import { ChipUsuario } from "./chipusuario.js";
import { Etiqueta } from "./etiqueta.js";
import { Respuesta } from "./respuesta.js";
import { Boton } from "./boton.js"
import { Usuario as UsuarioDAO } from "../../../api/v1/model.js"
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
    // TODO Feature: Hay 2 representaciones de pregunta. En el inicio, donde hay un listado, se ve la pregunta y la primera respuesta; y en la página propia se ve solo la pregunta y las respuestas se verían abajo con su propia representación.
	constructor({
        ID, titulo, cuerpo, fecha, post, respuestas, etiqueta
    }){
        if (titulo && cuerpo && fecha) {
            this.#titulo = titulo;
            this.#cuerpo = cuerpo;
            this.#fecha = new Fecha(fecha)
            this.#usuario = post.duenio;
            this.#respuestas = respuestas;
            this.#ID = ID;
            this.#etiquetas = etiqueta;
            
        }
	}

	render(){      
        return`
            <div class="pregunta">
                <div class="columns is-vcentered mb-1">
                    <div class="column is-narrow pr-0 py-0">
                    ${new ChipUsuario(this.#usuario).render()}
                    </div>
                    <div class="column is-narrow pl-0 py-0">
                        ${this.#fecha.render()}
                    </div>
                    ${ new BotonReporte({idPost:this.#ID}).render() }
                </div>
                <a href="http://localhost:8080/pregunta/${this.#ID}">
                    <div id="titulo">${this.#titulo}</div>
                </a>
                <div id="cuerpo">${this.#cuerpo}</div>
                <div id="etiquetas">
                ${this.#etiquetas ? this.#etiquetas.map(e=> new Etiqueta(e).render()).join('') : ''}
                </div>
                <div class="cantRespuestas">${this.#respuestas.length > 0 ? this.#respuestas.length + ' Respuestas' : ''}</div>
                ${ this.#respuestas.map((r) => new Respuesta(r).render()).join("") }
            </div>

            `;

    }
        

}

export {Pregunta};