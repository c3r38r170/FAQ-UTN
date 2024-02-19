import { superFetch } from '../libs/c3tools.js'
//import {superFetch} from 'https://unpkg.com/@c3r38r170/c3tools@1.1.0/c3tools.m.js';

class Formulario{
	static instancias = {};

	#endpoint='';
	#id='';
	#textoEnviar='';
	#funcionRetorno=null;
	campos=[];
	verbo=[];
	#clasesBotonEnviar='';

	constructor(id,endpoint,campos,funcionRetorno,{textoEnviar='Enviar',verbo='POST',clasesBoton : clasesBotonEnviar='button is-primary mt-3'}={},){
		this.#id=id;
		this.#endpoint=endpoint;
		this.campos=campos;
		this.verbo=verbo;
		this.#textoEnviar=textoEnviar;
		this.#funcionRetorno=funcionRetorno;
		this.#clasesBotonEnviar=clasesBotonEnviar;
		Formulario.instancias[id]=this;
	}

	enviar(e){
		e.preventDefault();
		// ! No funciona GET con FormData.

		// Crear un objeto FormData para facilitar la obtención de datos del formulario
		const formData = new FormData(e.target);

		// Crear un objeto para almacenar los datos
		const datos = {};
	
		// Iterar sobre las entradas de FormData y asignarlas al objeto de datos
		formData.forEach((value, key) => {
			// Reflect.has in favor of: object.hasOwnProperty(key)
			if(!Reflect.has(datos, key)){
					datos[key] = value;
					return;
			}
			if(!Array.isArray(datos[key])){
					datos[key] = [datos[key]];
			}
			datos[key].push(value);
		});

		superFetch(this.#endpoint,datos,{ method: this.verbo})
			.then(res=>res.text())
			.then(this.#funcionRetorno);
	}

	render(){
		return `<form id=${this.#id} class="" onsubmit="Formulario.instancias['${this.#id}'].enviar(event)">`
			+ this.campos.reduce((html,c)=>html+(new Campo(c)).render(),'') 
			// TODO Refactor: new Boton ??
			+`<input class="button ${this.#clasesBotonEnviar}" type=submit value="${this.#textoEnviar}">`
			+'</form>';
	}
}

class Campo{
	#name='';
	#textoEtiqueta='';
	#type;
	#required=true;
	#value;
	#clases;
	#extra = null;

	constructor({name,textoEtiqueta,type,required=true,value,extra,clasesBoton}){
		// TODO Feature: Tirar error si no estan los necesarios.
		this.#name=name;
		this.#textoEtiqueta=textoEtiqueta;
		this.#required=required;
		this.#value=value;
		this.#type=type;
		this.#clases = clasesBoton||"";
		this.#extra = extra;
	}
	render(){
		let html=`<label class="label">${this.#textoEtiqueta}<input class="input ${this.#clases}" name="${this.#name}"`
			,endTag='/>';
		
		if(this.#type){
			switch(this.#type){
			case 'textarea':
				html=html.replace('input','textarea');
				endTag='></textarea>';
				break;
			case 'select':
				html=html.replace('input','select');
				endTag=`>${this.#extra}</select>`;
				break;
			case 'hidden':
				// TODO Refactor: DRY, usar find, indexOf, o algo así.
				html=html.replace('<label class="label">'+this.#textoEtiqueta,'');
				html+=` type="${this.#type}"`;
				break;
			case 'number':
				// * min, max, step...
				html+=' '+this.#extra;
			// ! no break;
			default:
				html+=` type="${this.#type}"`;
			}
		}
		if(this.#required)
			html+=` required`;
		if(this.#value)
			html+=` value="${this.#value}"`;
			
		return html+endTag+'</label>';
	}
}

export {Formulario};