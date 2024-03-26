import { ALL, SqS, superFetch } from '../libs/c3tools.js';
import { ChipUsuario, ChipValoracion, Etiqueta, Respuesta, Boton, Fecha, BotonReporte, Formulario, BotonSuscripcion, Desplegable } from "./todos.js";

class Pregunta {
    #ID;
    #titulo = '';
    #cuerpo = '';
    #fecha = null;
    #duenio = null;
    #etiquetas = []
    #respuestas = []
    #instanciaModal = null;
    #usuarioActual = null;
    #respuestasCount = 0;
    #chipValoracion = null;
    #estaSuscripto = false;
    #botonEditar;
    #desplegable;
    constructor({ ID, titulo, cuerpo, fecha, post, respuestas, etiquetas, respuestasCount, suscripciones }, instanciaModal, usuario) {
        // TODO Feature: Pensar condiciones de fallo de creación. Considerar que puede venir sin cuerpo (formato corto) o sin título (/pregunta, quitado "artificialmente")

        this.#ID = ID;
        this.#titulo = titulo;

        if (post) { // * Formato largo.
            this.#cuerpo = cuerpo ? cuerpo : post.cuerpo;
            this.#fecha = new Fecha(fecha)
            this.#duenio = post.duenio;
            this.#respuestas = respuestas;
            this.#respuestasCount = respuestasCount;
            this.#etiquetas = etiquetas;
            this.#instanciaModal = instanciaModal;
            this.#usuarioActual = usuario;
            // ! El post viene sin votos cuando se trata de una representación sin interacciones en la moderación (ni controles de votación, ni de suscripción).
            if ((post.votos && this.#usuarioActual) || !usuario && post.votos) { // TODO Refactor: Este condicional huele mal
                this.#chipValoracion = new ChipValoracion({
                    ID
                    , votos: post.votos
                    , usuarioActual: usuario
                    , duenio: post.duenio
                });
                if (suscripciones && this.#usuarioActual) {
                    if (!Array.isArray(suscripciones)) suscripciones = [suscripciones]
                    this.#estaSuscripto = suscripciones.some(sus => sus.suscriptoDNI == this.#usuarioActual.DNI);
                }
            }
            this.#botonEditar = `<div class="ml-auto"> <a href="/pregunta/` + this.#ID + `/editar"><i class="fa-solid fa-pen-to-square"></i></a>`;

        }

        if (this.#usuarioActual) {
            this.#desplegable = new Desplegable('opcionesPregunta' + this.#ID, '<i class="fa-solid fa-ellipsis fa-lg"></i>', undefined, undefined, 'opcionesPost');
            if (this.#usuarioActual.DNI == this.#duenio.DNI) {
                let thisID = this.#ID;
                let form = new Formulario(
                    'eliminadorPregunta' + thisID
                    , '/api/post/' + thisID
                    , []
                    , (txt, { ok, codigo }) => {
                        if (!ok) {
                            Swal.error(txt);
                            return;
                        }

                        let preguntas = SqS(`.pregunta`, { n: ALL });
                        if (preguntas.length == 1) { //* Ruta de la pregunta misma, o una búsqueda con un solo resultado.
                            location.reload();
                        } else {
                            preguntas.find(p => p.dataset.postId == +txt /* post.ID del backend */).remove()
                        }
                    }
                    , {
                        textoEnviar: 'Eliminar'
                        , verbo: 'DELETE'
                        , clasesBoton: 'mx-auto is-danger w-100'
                        , alEnviar: (e) => {
                            e.preventDefault();
                            return new Promise((resolve, reject) => {
                                Swal.confirmar('¿Seguro que desea eliminar esta pregunta? Esto no se puede deshacer.')
                                    .then(res => {
                                        if (res.isConfirmed) {
                                            resolve();
                                            // TODO Refactor: Esto de acá abajo genera un error?? Quizá porque nunca se catchea... "Uncaught (in promise) undefined"
                                        } else reject();
                                    })
                            });
                        }
                    }
                ).render();
                let opciones = [
                    // TODO UX: Ver la posibilildad de que esto sea un botón .button.is-link.is-rounded ; habría que modificar Desplegable para que acepte tipo:'componente', y esto también beneficiaría a la forma de pasar el formulario.
                    {
                        descripcion: "Editar",
                        tipo: "link",
                        href: "/pregunta/" + this.#ID + "/editar",
                    },
                    {
                        tipo: "form",
                        render: form
                    },
                ];
                this.#desplegable.opciones = opciones;
            } else {

                // {name,textoEtiqueta,type,required=true,value=''/* TODO Refactor: null? */,extra,placeholder, clasesInput}){
                let form = new Formulario(
                    'reportadorPost' + this.#ID,
                    // "/post/:reportadoID/reporte"
                    '/api/post/' + this.#ID + '/reporte',
                    [{
                        name: "tipoID",
                        textoEtiqueta: "Lenguaje Vulgar",
                        value: '1',
                        type: "radio"
                    },
                    {
                        name: "tipoID",
                        textoEtiqueta: "Pregunta repetida",
                        value: '2',
                        type: "radio"
                    }],
                    (res) => { Swal.exito(`${res}`) },
                    { textoEnviar: 'Reportar', verbo: 'POST', clasesBoton: 'mx-auto is-link w-100' }
                ).render()
                let opciones = [
                    {
                        tipo: "form",
                        render: form
                    }
                ];
                this.#desplegable.opciones = opciones;
            }
        } else {
            this.#desplegable = undefined;
        }

    }

    render() {
        // TODO Feature: Permitir texto enriquecido. Tanto acá como en respuestas. Empecemos detectando y convirtiendo links, podemos seguir con ** para negrita y **** para subrayado... eventualmente meteríamos un motor de markdown.

        return this.#duenio ? // * Formato largo
            `<div class="pregunta" data-post-id="${this.#ID}">
                <div class="encabezado">
                    ${new ChipUsuario(this.#duenio).render()}
                    <div class="pl-0 py-0">
                        ${this.#fecha.render()}
                    </div>
                    ${this.#usuarioActual ? new BotonSuscripcion(this.#ID, '/api/pregunta/' + this.#ID + '/suscripcion', this.#estaSuscripto).render() : ''}
                    ${this.#usuarioActual ? '<div class="ml-auto">' + this.#desplegable.render() + '</div>' : ''}
                </div>
                ${this.#chipValoracion ? this.#chipValoracion.render() : ''}
                <a href="/pregunta/${this.#ID}">
                    <div class="titulo">${this.#titulo}</div>
                </a>
                <div class="cuerpo">${this.#cuerpo?.replace(/\n/g, '<br>')}</div>
                <div class="etiquetas">
                ${this.#etiquetas ? this.#etiquetas.map(e => new Etiqueta(e.etiquetum).render()).join('') : ''}
                </div>
                <div class="cantRespuestas">${this.#respuestasCount > 0 ? '<i class="fa-solid fa-reply mr-2"></i>' + this.#respuestasCount + ' Respuestas' : ''}</div>
                <!-- ! Las respuestas están dentro de la pregunta por la posibilidad (descartada) de poner la respuesta destacada en los listados de preguntas. -->
                ${this.#respuestas ? this.#respuestas.map((r) => new Respuesta(r, this.#instanciaModal, this.#usuarioActual ? this.#usuarioActual : null).render()).join("") : ''}
            </div>`
            : `<a href="/pregunta/${this.#ID}" class="pregunta" target="_blank"> <div class="titulo">${this.#titulo}</div> </a>`;

    }


}

export { Pregunta };