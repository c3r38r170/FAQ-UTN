import { ChipUsuario } from "./chipusuario.js";
import { Etiqueta } from "./etiqueta.js";
import { Respuesta } from "./respuesta.js";
import { Boton } from "./boton.js"

class Pregunta{
    #titulo;
    #cuerpo;
    #fecha;
    #usuario={
        nombre: 'John Doe',
        tipo: 'Administrador',
        imagen: 'https://definicion.de/wp-content/uploads/2019/07/perfil-de-usuario.png'
    }
    #etiquetas= [
        {etiqueta: 'facultad'},
        {etiqueta: 'estudio'},
        {etiqueta: 'materias'}
    ]
    #respuestas= [{
        usuario: {
            nombre: 'Jane Doe',
            tipo: 'Alumno',
            imagen: 'https://definicion.de/wp-content/uploads/2019/07/perfil-de-usuario.png'
        },
        valoracion: '30',
        cuerpo: 'andard dum andapsum is simply dummy text of the printing and the inrd dumandard dum',
        fecha: '25 de Diciembre de 2024'
    }]
    #chipusuario;
    // TODO Feature: Hay 2 representaciones de pregunta. En el inicio, donde hay un listado, se ve la pregunta y la primera respuesta; y en la página propia se ve solo la pregunta y las respuestas se verían abajo con su propia representación.
	constructor({
        titulo, cuerpo, fecha
    }){
		this.#titulo = titulo;
		this.#cuerpo= cuerpo;
        this.#fecha = fecha;
        this.#chipusuario = new ChipUsuario(this.#usuario)
        //pregunta.etiquetas.map(e=>this.etiquetas.push(new Etiqueta(e)))
        
	}
	render(){
		return`
        <div class="pregunta">
            <div class="columns is-vcentered mb-1">
                <div class="column is-narrow pr-0 py-0">
                ${this.#chipusuario.render()}
                </div>
                <div class="column is-narrow pl-0 py-0">
                    <div id="fecha">•  ${this.#fecha}</div>
                </div>
                <button id="reporte" onclick="${this.reportar()}">
                    <span>
                        <i class="fa-solid fa-circle-exclamation">
                        </i>
                    </span>
                </button>
            </div>
            <div id="titulo">${this.#titulo}</div>
            <div id="cuerpo">${this.#cuerpo}</div>
            <div id="etiquetas">
            ${this.#etiquetas.map(e=> new Etiqueta(e).render()).join('')}
            </div>
        </div>

        ${this.#respuestas.map((r) => new Respuesta(r).render()).join("")}
        `;
	}

    reportar(){

    }
}

export {Pregunta};