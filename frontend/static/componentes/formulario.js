import { superFetch, createElement } from '../libs/c3tools.js'
import { Boton } from './boton.js';

class Formulario {
	static instancias = {};

	#endpoint = '';
	#id = '';
	#textoEnviar = '';
	#funcionRetorno = null;
	campos = [];
	verbo = [];
	#clasesBotonEnviar = '';
	#alEnviar = null;

	constructor(id, endpoint, campos, funcionRetorno, { textoEnviar = 'Enviar', verbo = 'POST', clasesBoton: clasesBotonEnviar = 'is-primary mt-3', alEnviar = null } = {},) {
		this.#id = id;
		this.#endpoint = endpoint;
		this.campos = campos;
		this.verbo = verbo;
		this.#textoEnviar = textoEnviar;
		this.#funcionRetorno = funcionRetorno;
		this.#clasesBotonEnviar = clasesBotonEnviar;
		this.#alEnviar = alEnviar;

		Formulario.instancias[id] = this;
	}

	enviar(e) {
		let form = e.target;

		if (this.#alEnviar) {
			let respuestaAlEnviar = this.#alEnviar(e);
			// ! alEnviar se puede usar como validador personalizado.
			if (respuestaAlEnviar === false) {
				return;
			}
		}

		if (!this.#endpoint) { // ! Formulario tradicional de HTML que redirige para enviar los datos.
			return;
		}

		e.preventDefault();
		// ! No funciona GET con FormData.


		// Crear un objeto FormData para facilitar la obtención de datos del formulario
		const formData = new FormData(form);

		const fileInput = document.querySelector(`#${this.#id} input[type="file"]`);
		let datos;
		if (fileInput) {
			datos = formData;


		} else {

			// Crear un objeto para almacenar los datos
			datos = {};

			// Iterar sobre las entradas de FormData y asignarlas al objeto de datos
			formData.forEach((value, key) => {
				// Reflect.has in favor of: object.hasOwnProperty(key)
				if (!Reflect.has(datos, key)) {
					datos[key] = value;
					return;
				}
				if (!Array.isArray(datos[key])) {
					datos[key] = [datos[key]];
				}
				datos[key].push(value);
			});
		}

		let ok, codigo;
		let fieldset = form.firstElementChild;
		fieldset.disabled = true;
		let submitter = e.submitter;
		let botonCarga = createElement('DIV', {
			classList: [...e.submitter.classList, 'boton-carga']
			, innerHTML: '<img src="/loading.gif">'
			, style: {
				height: submitter.offsetHeight + 'px'
				, width: submitter.offsetWidth + 'px'
			}
		});
		submitter.before(botonCarga);
		superFetch(this.#endpoint, datos, { method: this.verbo })
			.then(res => {
				ok = res.ok;
				if (!ok) {
					fieldset.disabled = false;
					// TODO Feature: Probar en los formularios que se reutilizan, qué pasa cuando salen bien, y esto no se ejecuta
					botonCarga.remove();
				}
				codigo = res.status;
				return res.text();
			})
			.then(txt => this.#funcionRetorno(txt, { ok, codigo })).catch(error => {
				console.error('Error con formulario:', error);
			});
	}

	render() {
		// TODO Refactor: Eliminar estilo en línea, eliminar el atributo clase si no hace falta.
		// style="padding-top:32px;" class="" 
		return `<form id=${this.#id} onsubmit="Formulario.instancias['${this.#id}'].enviar(event)" enctype="multipart/form-data"><fieldset>`
			+ this.campos.reduce((html, c) => html + (new Campo(c)).render(), '')
			+ new Boton({ classes: this.#clasesBotonEnviar, titulo: this.#textoEnviar }).render()
			+ '</fieldset></form>'
			+ this.instanciaAScript();
	}

	instanciaAScript() {
		/* *
			Lo de las funciones es así:
			- método:
				- Formato: nombre(){}
				- Acción: Ponerle function atrás
			- flecha:
				- Formato: ()=>{}
				- Acción: Nada.
			- anónima:
				- Formato: function(){}
				- Acción: Nada.
		*/
		let representacionDeLaFuncion;
		if (this.#funcionRetorno) {
			representacionDeLaFuncion = this.#funcionRetorno.toString();
			let parteHastaPrimerParentesis = representacionDeLaFuncion.substring(0, representacionDeLaFuncion.indexOf('('));
			if (parteHastaPrimerParentesis/* ! No es flecha. */ && parteHastaPrimerParentesis != 'function' /* ! No es anónima. */) {
				representacionDeLaFuncion = 'function ' + representacionDeLaFuncion;
			}
		} else representacionDeLaFuncion = 'null';
		// ! Queda terminantemente prohibido nombrar funciones con el prefijo `function`

		return '<script> addEventListener("load",()=> {'

			// id,endpoint,campos,funcionRetorno,{textoEnviar='Enviar',verbo='POST',clasesBoton : clasesBotonEnviar='button is-primary mt-3'}={}
			+ `Formulario.instancias['${this.#id}']=new Formulario(
                '${this.#id}',
                ${JSON.stringify(this.#endpoint)},
                ${JSON.stringify(this.campos)},
                ${representacionDeLaFuncion},
                {
                    textoEnviar: '${this.#textoEnviar}',
                    verbo: '${this.verbo}',
                    clasesBoton: '${this.#clasesBotonEnviar}'
                }
            )`
			+ '}); </script>'
	}
}

class Campo {
	#name = '';
	#textoEtiqueta = '';
	#type;
	#required = true;
	#value;
	#clasesInput;
	#extra = null;
	#placeholder = '';

	constructor({ name, textoEtiqueta, type, required = true, value = ''/* TODO Refactor: null? */, extra, placeholder, clasesInput }) {
		// TODO Feature: Tirar error si no estan los necesarios.
		this.#name = name;
		this.#textoEtiqueta = textoEtiqueta;
		this.#required = required;
		this.#value = value;
		this.#type = type;
		this.#clasesInput = clasesInput || "";
		this.#extra = extra;
		this.#placeholder = placeholder;
	}


	render() {
		let html = `<label class="label">${this.#textoEtiqueta}<input class="input ${this.#clasesInput}" name="${this.#name}"`
			, endTag = '/>';

		if (this.#type) {
			switch (this.#type) {
				case 'lista-etiquetas':
					html += ' data-type = "tags" data-placeholder="Etiquetas" data-selectable="false" multiple '
				// ! no break;
				case 'select':
					html = html.replace('input', 'select');
					endTag = `>${this.#extra}</select>`;
					break;
				case 'hidden':
					// TODO Refactor: DRY, usar find, indexOf, o algo así.
					html = html.replace('<label class="label">' + this.#textoEtiqueta, '');
					html += ` type="${this.#type}"`;
					break;
				case 'radio':
					html = html.replace(this.#textoEtiqueta, '');
					// TODO Feature: Considerar required, poner un comentario de por qué este caso es especial.
					html = html.replace('<input class="input', '<input type="radio" required value="' + this.#value + '" class="mr-2 ')
					html = html.replace('<label class="label"', '<label class="label radio-label"')
					return html + endTag + this.#textoEtiqueta + '</label>'
				case 'textarea':
					html = html.replaceAll('input', 'textarea');
					endTag = `>${this.#value}</textarea>`;
				case 'file':
				case 'number':
					// * min, max, step...
					html += ' ' + this.#extra;

				// ! no break;
				default:
					html += ` type="${this.#type}"`;
			}
		}
		if (this.#required)
			html += ` required`;
		if (this.#value) // * Este no aplica en caso de lista-etiqueta o select.
			html += ` value="${this.#value}"`;
		if (this.#placeholder) {
			html += ` placeholder="${this.#placeholder}"`;
		}

		return html + endTag + '</label>';

	}
}

export { Formulario };