import { MensajeInterfaz } from './mensajeInterfaz.js';

class DesplazamientoInfinito{
	// TODO Refactor: Unificar configuracion de paginacion; como cantidad por pagina
	// Esto será de algún componente
	// Específicamente: Preguntas, Notificaciones...
	static instancias={};

	#endpoint='';
	pagina=1;
	#id='';
	#generadorDeComponentes=null;

	entidadesIniciales=[];

 	constructor(id,endpoint,transformarRespuestaEnComponente,primerasEntidades=[]){
		// TODO Feature: fallar si no se proveen los parámetros obligatorios. Aplicar a todfas las clases.
		this.#id=id;
		this.#endpoint=endpoint+(endpoint.includes('?')?'&':'?');
		this.#generadorDeComponentes=transformarRespuestaEnComponente;
		this.entidadesIniciales=primerasEntidades;

		DesplazamientoInfinito.instancias[id]=this;
	}

	navegar(e){
		let imagenAlcahuete=e.target;
		let contenedor=imagenAlcahuete.closest('.desplazamiento-infinito');
		// TODO Feature: Ver si tiene o no "?", y entonces poner "?" o "&". Quizá hacerlo en el constructor y tener algo como un this.#parametroPagina.  Mejor solución (aplicar a tabla): poner en el constructor de manera inteligente uno u otro, guardar la url con el parametro página, y simplemente hacer +(this.#pagina...);
		let url=this.#endpoint+`pagina=${this.pagina-1}`;
		this.pagina++;

		fetch(url,{
			credentials:'include',
			method:'GET'
		})
			.then(res=>res.json())
		/* new Promise((resolve, reject)=>{
			resolve(new Array(3).fill(null).map((n,i)=>(3*(this.#pagina-1)+i)));
		}) */
			.then((nuevasEntidades)=>{
				let html='';

				for(let ent of nuevasEntidades){
					html+=this.#generadorDeComponentes(ent);
				}

				imagenAlcahuete.closest('.loading').remove();
				html+=this.#generarUltimoComponente(nuevasEntidades.length);

				contenedor.innerHTML+=html;
			})
			// TODO Feature: catch; y finally?
	}

	#generarUltimoComponente(cantidadDeEntidadesEnIteracion=this.entidadesIniciales.length){
		let html='';

		// TODO Refactor: Poner algún componente de paginación en el frontend, que en su defecto obtenga la info del backend. Ver que no destruya ninguna renderización... quizá llevar la configuración del frontend AL backend? Suena a lo más oportuno, por mas que sea antiintuitivo...
		if(cantidadDeEntidadesEnIteracion==0){
			// TODO UX: Mensaje de que no hay más entidades, de que se llegó al fin del desplazamiento. Componente mensaje PFU-130
			html+=(new MensajeInterfaz('3','Llegaste al final.')).render();
		}else{
			// TODO UX: Un loading GIF que no de asco. Y que pegue con el resto.
			html+=`<div class="loading">`
			html+=`<img loading="lazy" src="/loading.gif" onload="if(DesplazamientoInfinito)DesplazamientoInfinito.instancias['${this.#id}'].navegar(event);else setTimeout(()=>this.src='/loading.gif?'+Math.random(),1000)">`;
			html+=`</div>`
		}

		return html;
	}

	render(){
		// TODO UX: CSS de esto
		return `<div id=${this.#id} class="desplazamiento-infinito">`+this.entidadesIniciales.map(this.#generadorDeComponentes).join('')+this.#generarUltimoComponente()+`</div>`;
	}
}

export {DesplazamientoInfinito};