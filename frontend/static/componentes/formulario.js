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

	constructor(id,endpoint,campos,funcionRetorno,{textoEnviar='Enviar',verbo='POST'}={}){
		this.#id=id;
		this.#endpoint=endpoint;
		this.campos=campos;
		this.verbo=verbo;
		this.#textoEnviar=textoEnviar;
		this.#funcionRetorno=funcionRetorno;

		Formulario.instancias[id]=this;
	}

	enviar(e){

		// ! No funciona GET con FormData.
		// TODO Refactor: Ver si funciona superFetch
		/* superFetch(this.#endpoint,new FormData(e.target))
			.then(res=>res.json)
			.then(this.#funcionRetorno); */
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
		return `<form onsubmit="Formulario.instancias[${this.#id}].enviar(event)">`
			+this.campos.reduce((html,c)=>html+(new Campo(...c)).render(),'')
			+`<input type=submit value="${this.#textoEnviar}">`
			+'</form>';
	}
}

class Campo{
	#name='';
	#etiqueta='';
	#type;
	#required=true;
	#value;

	constructor(name,etiqueta,{type,required=true,value}){
		this.#name=name;
		this.#etiqueta=etiqueta;
		this.#required=required;
		this.#value=value;
		this.#type=type;
	}
	render(){
		let html=`<label><span>${this.#etiqueta}</span><input name="${this.#name}"`;
		
		if(this.#type)
			html+=` type="${this.#type}"`;
		if(this.#required)
			html+=` required`;
		if(this.#value)
			html+=` value="${this.#value}"`;
			
		return html+'/></label';
	}
}

export {Formulario};