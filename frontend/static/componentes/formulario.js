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
	#clasesBotonEnviar;

	constructor(id,endpoint,campos,funcionRetorno,{textoEnviar='Enviar',verbo='POST'}={},clasesBotonEnviar){
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
		return `<form class=""onsubmit="Formulario.instancias['${this.#id}'].enviar(event)">`
			+ this.campos.reduce((html,c)=>html+(new Campo(...c)).render(),'') 
			+`<input class="button ${this.#clasesBotonEnviar}" type=submit value="${this.#textoEnviar}">`
			+'</form>';
	}
}

class Campo{
	#name='';
	#etiqueta='';
	#type;
	#required=true;
	#value;
	#clases;

	constructor(name,etiqueta,{type,required=true,value},
		clases){
		this.#name=name;
		this.#etiqueta=etiqueta;
		this.#required=required;
		this.#value=value;
		this.#type=type;
		this.#clases = clases
	}
	render(){
		let html=`<label class="label mt-4">${this.#etiqueta}</label><input class="input is-rounded ${this.#clases}" name="${this.#name}"`;
		
		if(this.#type)
			html+=` type="${this.#type}"`;
		if(this.#required)
			html+=` required`;
		if(this.#value)
			html+=` value="${this.#value}"`;
			
		return html+'/></label>';
	}
}

export {Formulario};