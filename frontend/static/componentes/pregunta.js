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
    #estaSuscripto = false ;
    #esMiPerfil = false;
    constructor({ID, titulo, cuerpo, fecha, post, respuestas, etiquetas, respuestasCount, usuariosSuscriptos},instanciaModal, sesion, esMiPerfil){
        // TODO Feature: Pensar condiciones de fallo de creación. Considerar que puede venir sin cuerpo (formato corto) o sin título (/pregunta, quitado "artificialmente")

        this.#ID = ID;
        this.#titulo = titulo;
        
        if(post){ // * Formato largo.
            this.#cuerpo = cuerpo;
            this.#fecha = new Fecha(fecha)
            this.#duenio = post.duenio;
            this.#respuestas = respuestas;
            this.#respuestasCount = respuestasCount;
            this.#etiquetas = etiquetas;
            this.#instanciaModal = instanciaModal;
            this.#usuarioActual=sesion?.usuario;
        this.#esMiPerfil = esMiPerfil;
    
            // ! El post viene sin votos cuando se trata de una representación sin interacciones en la moderación (ni controles de votación, ni de suscripción).
            if(post.votos && this.#usuarioActual){
                this.#chipValoracion=new ChipValoracion({
                    ID
                    ,votos:post.votos
                    ,usuarioActual:sesion
                });
                this.#estaSuscripto=usuariosSuscriptos.some(usuario=>usuario.DNI == this.#usuarioActual.DNI && usuario.suscripcionesPregunta.fecha_baja == null);
                // TODO Refactor: Que ni vengan las suscripciones que estén dadas de baja (no chequear que fecha_baja == null). fecha_baja es una eliminación suave.
            }
        }

	}

	render(){
        // TODO Feature: Permitir texto enriquecido. Tanto acá como en respuestas. Empecemos detectando y convirtiendo links, podemos seguir con ** para negrita y **** para subrayado... eventualmente meteríamos un motor de markdown.
        
        return this.#duenio? // * Formato largo
            `<div class="pregunta">
                <div class="encabezado">
                    ${new ChipUsuario(this.#duenio).render()}
                    <div class="pl-0 py-0">
                        ${this.#fecha.render()}
                    </div>
                    ${ this.#usuarioActual ? new BotonSuscripcion(this.#ID,'/api/pregunta/'+this.#ID+'/suscripcion', this.#estaSuscripto).render() : '' }
                    ${ (this.#instanciaModal && this.#usuarioActual && (this.#usuarioActual.DNI != this.#duenio.DNI))? new BotonReporte(this.#ID, this.#instanciaModal).render() : ((this.#esMiPerfil)? '<div class="ml-auto"> <a href="/perfil/preguntas/'+this.#ID+'/editar"><i class="fa-solid fa-pen-to-square"></i></a> <a><i class="fa-solid fa-trash ml-2"></i></a></div>' : '')}
                </div>
                ${this.#chipValoracion ? this.#chipValoracion.render() : ''}
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
            </div>`
            :`<a href="/pregunta/${this.#ID}" class="pregunta" target="_blank"> <div class="titulo">${this.#titulo}</div> </a>`;

    }
        

}

export {Pregunta};