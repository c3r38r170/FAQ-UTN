import {Fecha} from './fecha.js';

class Notificacion{
	static instancias ={};
	#texto;
    #tituloPregunta;
	visto;
	#tipo;
	#fecha;
	#idPregunta;
	#ID;
	//ppregunta ajena es notificacion por etiqueta suscripta 
	//respuesta ajena es notificacion por respuesta a pregunta propia o suscripta
	//respuesta o pregunta propia es notificación por valoración

	/*
	notificacion
	post
		usuario
		respuesta
			pregunta
		pregunta

	*/

	constructor(id,{
	    visto
		,post
		,createdAt
    },usuarioActualDNI){
			this.visto=visto;
			this.#ID=id;
			Notificacion.instancias[this.#ID]=this;
		this.#tituloPregunta = post.cuerpo;
		this.#fecha=new Fecha(createdAt);
		console.log(usuarioActualDNI)
		if(post.pregunta.ID!=null){
			if(post.duenio.DNI==usuarioActualDNI){
				this.#texto = 'Recibiste un nuevo voto:'
				this.#tituloPregunta = post.pregunta.titulo
				this.#idPregunta =post.pregunta.ID
			}else{
				this.#texto= 'Nueva pregunta que te puede interesar'
				this.#tituloPregunta = post.pregunta.titulo
				this.#idPregunta =post.pregunta.ID
			}
		}else{
			if(post.duenio.DNI==usuarioActualDNI){
				this.#texto = 'Recibiste un nuevo voto:'
				this.#tituloPregunta = post.respuesta.pregunta.titulo
				this.#idPregunta=post.respuesta.pregunta.ID
			}else{
				this.#texto = 'Nuevas respuestas en la pregunta '
				this.#tituloPregunta = post.respuesta.pregunta.titulo
				this.#idPregunta=post.respuesta.pregunta.ID
			}
		}

		
			/*
		// TODO Refactor: Preguntar una sola vez.
		
		if(post.pregunta.ID){ // * Es una notificación de una pregunta
			this.#tituloPregunta=post.pregunta.titulo;
		}else{ // * Es una notificación de una respuesta
			// TODO UX: Considerar mostrar algo de texto de la respuesta o no.
			this.#tituloPregunta=post.respuesta.pregunta.titulo;
		}

		if(post.duenio.DNI==usuarioActualDNI){
			this.#texto='Recibiste un nuevo voto positivo: ';
		}else{
			if(post.pregunta.ID){ // * Es una notificación de una pregunta
				this.#texto='Nueva pregunta que te puede interesar: ';
			}else{ // * Es una notificación de una respuesta
				this.#texto='Nuevas respuestas en la pregunta ';
			}
		}*/
	}

	static verNotificacion(){
		e.preventDefault();
	let aApretado = e.target.closest("a");
	let divChipNotificacion = aApretado.closest(".chip-notificacion");
	let id = divChipNotificacion.dataset.id;
	let idPregunta = divChipNotificacion.dataset.idPregunta;
	
	
	const url= `http://localhost:8080/api/notificacion`;
	fetch(url, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			ID: id 
		})
	}).then(response=>{
		window.location.replace('/pregunta/'+idPregunta)
	})

	}

	render(){
		// TODO UX: Estilos, visto no visto, al enlace, etc. (.notificacion)
		// TODO Feature: Implementar registro de visto. onclick
		return`
		<div class="notificacion ${this.visto==0? 'noti-no-vista': ''}" id='chip-notificacion-${this.#ID}' data-id='${this.#ID}' data-idPregunta='${this.#idPregunta}'>
			<div class="img-container">
				<img class="img" class="img" src="./user.webp"/>
			</div>
			<div class="noti-container">
			${this.#texto}<a class="notificacion" onclick="Notificacion.verNotificacion()">${this.#tituloPregunta}</a>
			${this.#fecha.render()}
			</div>
		</div>
        `;
	}
}

export {Notificacion};