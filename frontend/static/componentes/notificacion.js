import {Fecha} from './fecha.js';

class Notificacion{
	#texto;
    #tituloPregunta;
	visto;
	#tipo;
	#fecha;
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

	constructor({
        visto
		,post
		,createdAt
    },usuarioActualDNI){
			this.visto=visto;
		this.#tituloPregunta = post.cuerpo;
		this.#fecha=new Fecha(createdAt);
		console.log(usuarioActualDNI)
		if(post.pregunta.ID!=null){
			if(post.duenio.DNI==usuarioActualDNI){
				this.#texto = 'Recibiste un nuevo voto:'
				this.#tituloPregunta = post.pregunta.titulo
			}else{
				this.#texto= 'Nueva pregunta que te puede interesar'
				this.#tituloPregunta = post.pregunta.titulo
			}
		}else{
			if(post.duenio.DNI==usuarioActualDNI){
				this.#texto = 'Recibiste un nuevo voto:'
				this.#tituloPregunta = post.respuesta.pregunta.titulo
			}else{
				this.#texto = 'Nuevas respuestas en la pregunta '
				this.#tituloPregunta = post.respuesta.pregunta.titulo
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
	render(){
		// TODO UX: Estilos, visto no visto, al enlace, etc. (.notificacion)
		// TODO Feature: Implementar registro de visto. onclick
		return`
		<div class="notificacion ${this.visto==0? 'noti-no-vista': ''}">
			<div class="img-container">
				<img class="img" class="img" src="./user.webp"/>
			</div>
			<div class="noti-container">
			${this.#texto}<a class="notificacion" src="">${this.#tituloPregunta}</a>
			${this.#fecha.render()}
			</div>
		</div>
        `;
	}
}

export {Notificacion};