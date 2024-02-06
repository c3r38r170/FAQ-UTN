import { superFetch } from '../superFetch.js'
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

	constructor(id,endpoint,campos,funcionRetorno,{textoEnviar='Enviar',verbo='POST',clasesBoton : clasesBotonEnviar='is-link is-light is-small'}={},){
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
		console.log(e.target);
		// ! No funciona GET con FormData.
		// TODO Refactor: Ver si funciona superFetch


		// Crear un objeto FormData para facilitar la obtención de datos del formulario
		const formData = new FormData(e.target);

		// Crear un objeto para almacenar los datos
		const datos = {};
	
		// Iterar sobre las entradas de FormData y asignarlas al objeto de datos
		formData.forEach((valor, clave) => {
			datos[clave] = valor;
		});


		 superFetch(this.#endpoint,datos,{ method: this.verbo})
			.then(res=>res.json)
			.then(this.#funcionRetorno); 
		/* let options={
			credentials:'include'
		}

		let data=new
		
		if(this.verbo=='GET'){
			if(data)
				url+=[...JSONAsURLEncodedStringIterator(data)].reduce((acc,el)=>acc+=el.join('=')+'&','?');
		}else{
			options.this.verbo=this.verbo;
			if(whatIs(data)==Types.OBJECT){
				if(data instanceof FormData){
					options.body=data;
				}else{
					options.headers['Content-Type']='application/json';
					options.body=JSON.stringify(data);
				}
			}else if(data)
				options.body=data;
		}

		fetch(this.#endpoint,{
			body:new FormData(e.target)
		}) */
		
	}

	render(){
		return `<form class="" onsubmit="Formulario.instancias['${this.#id}'].enviar(event)">`
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
		this.#clases = clasesBoton;
		this.#extra = extra;
	}
	render(){
		let html=`<label class="label">${this.#textoEtiqueta}</label><input class="input ${this.#clases}" name="${this.#name}"`
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