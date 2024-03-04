import { superFetch } from '../libs/c3tools.js'

class Formulario{
	static instancias = {};

	#endpoint='';
	#id='';
	#textoEnviar='';
	#funcionRetorno=null;
	campos=[];
	verbo=[];
	#clasesBotonEnviar='';
	#alEnviar=null;

	constructor(id,endpoint,campos,funcionRetorno,{textoEnviar='Enviar',verbo='POST',clasesBoton : clasesBotonEnviar='is-primary mt-3',alEnviar=null}={},){
		this.#id=id;
		this.#endpoint=endpoint;
		this.campos=campos;
		this.verbo=verbo;
		this.#textoEnviar=textoEnviar;
		this.#funcionRetorno=funcionRetorno;
		this.#clasesBotonEnviar=clasesBotonEnviar;
		this.#alEnviar=alEnviar;

		Formulario.instancias[id]=this;
	}

	enviar(e){
		e.preventDefault();
		// ! No funciona GET con FormData.

		if(this.#alEnviar){
			this.#alEnviar();
		}

		
		// Crear un objeto FormData para facilitar la obtención de datos del formulario
		const formData = new FormData(e.target);
		
		const fileInput = document.querySelector(`#${this.#id} input[type="file"]`);
		let datos;
		if(fileInput){
			datos = formData;
			

		}else{

		// Crear un objeto para almacenar los datos
			datos = {};
		
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
		}
		let ok,codigo;
		superFetch(this.#endpoint,datos,{ method: this.verbo})
			.then(res=>{
				ok=res.ok;
				codigo=res.status;
				return res.text();
			})
			.then(txt=>this.#funcionRetorno(txt,{ok,codigo}));
	}

	render(){
        return `<form id=${this.#id} style="padding-top:32px;"class="" onsubmit="Formulario.instancias['${this.#id}'].enviar(event)" enctype="multipart/form-data"  >`
            + this.campos.reduce((html,c)=>html+(new Campo(c)).render(),'') 
            // TODO Refactor: new Boton ??
            +`<input class="button ${this.#clasesBotonEnviar}" type=submit value="${this.#textoEnviar}">`
            +'</form>'
            +this.instanciaAScript();
    }

    instanciaAScript(){
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
			let representacionDeLaFuncion=this.#funcionRetorno.toString();
			let parteHastaPrimerParentesis=representacionDeLaFuncion.substring(0,representacionDeLaFuncion.indexOf('('));
			if(parteHastaPrimerParentesis/* ! No es flecha. */ && parteHastaPrimerParentesis!='function' /* ! No es anónima. */){
				representacionDeLaFuncion='function '+representacionDeLaFuncion;
			}
			// ! Queda terminantemente prohibido nombrar funciones con el prefijo `function`

        return '<script> addEventListener("load",()=> {'

        // id,endpoint,campos,funcionRetorno,{textoEnviar='Enviar',verbo='POST',clasesBoton : clasesBotonEnviar='button is-primary mt-3'}={}
            +    `Formulario.instancias['${this.#id}']=new Formulario(
                '${this.#id}',
                '${this.#endpoint}',
                '${JSON.stringify(this.campos)}',
                ${representacionDeLaFuncion},
                {
                    textoEnviar: '${this.#textoEnviar}',
                    verbo: '${this.verbo}',
                    clasesBoton: '${this.#clasesBotonEnviar}'
                }
            )`
            +'}); </script>'
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
				// TODO Feature: Usar extra para ponerle rows y cols. rows=4 por default. O CSS, porque por lo que vi, rows=4 no anda por Bulma.
				html=html.replaceAll('input','textarea');
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
			case 'file':
				html+=' '+this.#extra;
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
		if(this.#value){
			html+=` value="${this.#value}"`;
		}
			
		return html+endTag+'</label>';
	}
}

export {Formulario};