import { ChipUsuario, ChipValoracion, Etiqueta, Respuesta, Boton, Fecha, BotonReporte, Formulario, BotonSuscripcion, Desplegable } from "./todos.js";

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
    #botonEditar;
    #desplegable;
    constructor({ID, titulo, cuerpo, fecha, post, respuestas, etiquetas, respuestasCount, suscripciones},instanciaModal, sesion){
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
            // ! El post viene sin votos cuando se trata de una representación sin interacciones en la moderación (ni controles de votación, ni de suscripción).
            if(post.votos && this.#usuarioActual){
                this.#chipValoracion=new ChipValoracion({
                    ID
                    ,votos:post.votos
                    ,usuarioActual:sesion
                });
                if(suscripciones){
                    if(!Array.isArray(suscripciones)) suscripciones=[suscripciones]
                    this.#estaSuscripto=suscripciones.some(sus=>sus.suscripto.DNI == this.#usuarioActual.DNI);
            }
                // TODO Refactor: Que ni vengan las suscripciones que estén dadas de baja (no chequear que fecha_baja == null). fecha_baja es una eliminación suave.
            }
            this.#botonEditar = `<div class="ml-auto"> <a href="/pregunta/`+this.#ID+`/editar"><i class="fa-solid fa-pen-to-square"></i></a>`;

        }

        if(this.#usuarioActual){
            this.#desplegable = new Desplegable('opcionesPregunta'+this.#ID, '<i class="fa-solid fa-ellipsis fa-lg"></i>',undefined,undefined,'opcionesPost');
            if(this.#usuarioActual.DNI == this.#duenio.DNI){
                // TODO Refactor: No usar alert. Usar Swal.
                let form = new Formulario('eliminadorPregunta'+this.#ID, '/api/post/'+this.#ID, [],(res)=>{alert(res)},{textoEnviar:'Eliminar',verbo: 'DELETE' ,clasesBoton: 'mx-auto is-danger w-100'}).render()
                let opciones = [
                {
                    descripcion: "Editar",
                    tipo: "link",
                    href: "/pregunta/"+this.#ID+"/editar",
                },
                {
                    tipo: "form",
                    render: form
                },
                ];
                this.#desplegable.opciones = opciones;
            }else{
                // "/post/:reportadoID/reporte"

                // {name,textoEtiqueta,type,required=true,value=''/* TODO Refactor: null? */,extra,placeholder, clasesInput}){
                let form = new Formulario(
                    'reportadorPost'+this.#ID,
                    '/api/post/'+this.#ID+'/reporte',
                    [{
                    name: "tipoID",
                    textoEtiqueta: "Lenguaje Vulgar",
                    value: '1',
                    type: "radio"
                  },
                  {
                    name: "tipoID",
                    textoEtiqueta: "Post repetido",
                    value: '2',
                    type: "radio"
                  }],
                  // TODO Refactor: No usar alert. Usar Swal.
                  (res)=>{alert(res)},
                  {textoEnviar:'Reportar',verbo: 'POST' ,clasesBoton: 'mx-auto is-link w-100'}
                  ).render()
                let opciones = [
                    {
                        tipo: "form",
                        render: form
                        
                    }
                    ];
                this.#desplegable.opciones = opciones;
            }
        }else{
            this.#desplegable=undefined;
        }

	}

	render(){
        // TODO Feature: Permitir texto enriquecido. Tanto acá como en respuestas. Empecemos detectando y convirtiendo links, podemos seguir con ** para negrita y **** para subrayado... eventualmente meteríamos un motor de markdown.
        
        return this.#duenio? // * Formato largo
            `<div class="pregunta" data-post-id="${this.#ID}">
                <div class="encabezado">
                    ${new ChipUsuario(this.#duenio).render()}
                    <div class="pl-0 py-0">
                        ${this.#fecha.render()}
                    </div>
                    ${ this.#usuarioActual ? new BotonSuscripcion(this.#ID,'/api/pregunta/'+this.#ID+'/suscripcion', this.#estaSuscripto).render() : '' }
                    ${ this.#usuarioActual ?  '<div class="ml-auto">'+this.#desplegable.render()+'</div>' : '' }
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