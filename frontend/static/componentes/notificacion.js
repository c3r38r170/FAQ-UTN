import { Fecha } from './fecha.js';

class Notificacion {
	#texto;
	#tituloPregunta;
	visto;
	#tipo;
	#fecha;
	#idPregunta;
	#ID;
	//pregunta ajena es notificacion por etiqueta suscripta 
	//respuesta ajena es notificacion por respuesta a pregunta propia o suscripta
	//respuesta o pregunta propia es notificación por valoración

	/* TODO Docs: Actualizar estos comentarios.
	notificacion
	post
		usuario
		respuesta
			pregunta
		pregunta
	*/

	constructor(id, {
		visto
		, createdAt
		, cantidad
		, propia
		, titulo
		, respuestaPreguntaID
		, preguntaID
	}, usuarioActualDNI) {
		this.visto = visto;
		this.#ID = id;
		this.#tituloPregunta = titulo;
		this.#fecha = new Fecha(createdAt);
		if (preguntaID) {
			this.#idPregunta = preguntaID
			if (propia) {
				this.#texto = 'Nuevos votos positivos en tu pregunta:'
			} else {
				this.#texto = 'Nueva pregunta que te puede interesar:'
			}
		} else {
			this.#idPregunta = respuestaPreguntaID
			if (propia) {
				this.#texto = 'Fuiste votado respondiendo a:'
			} else {
				this.#texto = 'Nuevas respuestas en la pregunta'
			}
		}
	}

	static verNotificacion(e) {
		e.preventDefault();
		let aApretado = e.target.closest("a");
		let divChipNotificacion = aApretado.closest(".notificacion");
		let id = divChipNotificacion.dataset.id;
		let idPregunta = divChipNotificacion.dataset.idPregunta;


		const url = `http://localhost:8080/api/notificacion`;
		// TODO Refactor: Ver si esto choca o es equivalente al hecho de que las notificaciones se ven al entrar en la página.
		fetch(url, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				ID: id
			})
		}).then(response => {
			window.location.replace('/pregunta/' + idPregunta)
		}).catch(error => {
			console.error('Error al ver notificación:', error);
		});

	}

	render() {
		return `
		<div class="chip-notificacion notificacion ${this.visto == 0 ? 'noti-no-vista' : ''}" id='chip-notificacion-${this.#ID}' data-id='${this.#ID}' data-idPregunta='${this.#idPregunta}'>
			<div class="img-container">
				<img class="img" class="img" src="${this.visto == 0 ? "/no-vista.png" : "/vista.png"}"/>
			</div>
			<div class="noti-container">
			${this.#texto} <a class="notificacion" href="/pregunta/${this.#idPregunta}">${this.#tituloPregunta}</a>
			${this.#fecha.render()}
			</div>
		</div>
        `;
	}
}

export { Notificacion };