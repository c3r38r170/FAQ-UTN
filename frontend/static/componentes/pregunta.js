import { ChipUsuario, ChipValoracion, Etiqueta, Respuesta, Boton, Fecha, BotonReporte, Formulario, BotonSuscripcion } from "./todos.js";

class Pregunta{
    #ID;
    #titulo='';
    #cuerpo='';
    #fecha=null;
    #duenio=null;
    #etiquetas= []
    #respuestas= []
    #instanciaModal=null;
    #usuarioActual=null;
    #respuestasCount=0;
    #chipValoracion=null;
    // TODO Feature: Hay 2 representaciones de pregunta. En el inicio, donde hay un listado, se ve la pregunta y la primera respuesta; y en la página propia se ve solo la pregunta y las respuestas se verían abajo con su propia representación.

	constructor({ID, titulo, cuerpo, fecha, post, respuestas, etiquetas, respuestasCount, suscriptos},instanciaModal, sesion){
        // TODO Feature: Pensar condiciones de fallo de creación. Considerar que puede venir sin cuerpo (formato corto) o sin título (/pregunta, quitado "artificialmente")

        this.#titulo = titulo;
        this.#cuerpo = cuerpo;
        this.#fecha = new Fecha(fecha)
        this.#duenio = post.duenio;
        this.#respuestas = respuestas;
        this.#respuestasCount = respuestasCount;
        this.#ID = ID;
        this.#etiquetas = etiquetas;
        this.#instanciaModal = instanciaModal;
        this.#usuarioActual=sesion?.usuario;
        if(post.votos && this.#usuarioActual){
            this.#chipValoracion=new ChipValoracion({
                ID
                ,votos:post.votos
                ,usuarioActual:sesion
            });
        }
	}

	render(){
        // TODO Feature: Votación para preguntas.
        // TODO Feature: Permitir texto enriquecido. Tanto acá como en respuestas. Empecemos detectando y convirtiendo links, podemos seguir con ** para negrita y **** para subrayado... eventualmente meteríamos un motor de markdown.
        return`
            <div class="pregunta">
                <div class="encabezado">
                    ${new ChipUsuario(this.#duenio).render()}
                    <div class="pl-0 py-0">
                        ${this.#fecha.render()}
                    </div>
                    ${ this.#usuarioActual == undefined ? '' : new BotonSuscripcion(this.#ID,'/api/pregunta/'+this.#ID+'/suscripcion').render() }
                    ${ (this.#instanciaModal && this.#usuarioActual)?new BotonReporte(this.#ID, this.#instanciaModal).render():'' }
                </div>
                ${this.#chipValoracion?this.#chipValoracion.render():''}
                <a href="/pregunta/${this.#ID}">
                    <div class="titulo">${this.#titulo}</div>
                </a>
                <div class="cuerpo">${this.#cuerpo.replace(/\n/g, '<br>')}</div>
                <div class="etiquetas">
                ${this.#etiquetas ? this.#etiquetas.map(e=>new Etiqueta(e.etiquetum).render()).join('') : ''}
                </div>
                <div class="cantRespuestas">${this.#respuestasCount > 0 ? this.#respuestasCount + ' Respuestas' : ''}</div>
                <!-- ! Las respuestas están dentro de la pregunta por la posibilidad (descartada) de poner la respuesta destacada en los listados de preguntas. -->
                ${ this.#respuestas ? this.#respuestas.map((r) => new Respuesta(r,this.#instanciaModal,this.#usuarioActual?{usuario:this.#usuarioActual}:null).render()).join("") : ''}
            </div>

            `;

    }
        

}

export {Pregunta};