import { MensajeInterfaz } from './mensajeInterfaz.js';

class DesplazamientoInfinito {
	static instancias = {};

	#endpoint = '';
	set endpoint(valor) {
		this.#endpoint = valor + (valor.includes('?') ? '&' : '?');
	};
	// TODO Refactor: Ver si hace falta el setter
	get endpoint() {
		return this.#endpoint;
	}
	pagina = 1;
	#id = '';
	#generadorDeComponentes = null;

	entidadesIniciales = null;// * []|null

	// TODO Refactor: Ver si hacer privado? Creo que no, pero revisar.
	mensajeFinal = null;
	mensajeVacio = null;

	constructor(
		id
		, endpoint
		, transformarRespuestaEnComponente
		, primerasEntidades = null
		, {
			mensajeFinal = new MensajeInterfaz(MensajeInterfaz.ADVERTENCIA, 'Llegaste al final.')
			, mensajeVacio = new MensajeInterfaz(MensajeInterfaz.INFORMACION, 'No se han encontrado resultados a la búsqueda.')
		} = {}) {
		// TODO Feature: fallar si no se proveen los parámetros obligatorios. Aplicar a todfas las clases.
		this.#id = id;
		this.endpoint = endpoint;
		this.#generadorDeComponentes = transformarRespuestaEnComponente;
		// * Las primeras entidades solo se usan desde el servidor y sirven para servir contenido generado y así mejorar el SEO de la página. Si solamente se generara el contenido dinámico desde el frontend, no podría ser analizado.
		this.entidadesIniciales = primerasEntidades;
		this.mensajeFinal = mensajeFinal;
		this.mensajeVacio = mensajeVacio;

		DesplazamientoInfinito.instancias[this.#id] = this;
	}

	reiniciar(nuevoEndpoint) {
		this.endpoint = nuevoEndpoint;
		this.pagina = 1
		document.getElementById(this.#id).innerHTML = this.#generarUltimoComponente(-1);
	}

	navegar(e) {
		let imagenAlcahuete = e.target;
		let contenedor = imagenAlcahuete.closest('.desplazamiento-infinito');
		let url = this.endpoint + `pagina=${this.pagina - 1}`;

		// TODO Fearure: Reaccionar a errores, como en formulario
		fetch(url, {
			credentials: 'include',
			method: 'GET'
		})
			.then(res => res.json())
			.then((nuevasEntidades) => {
				let html = '';

				for (let ent of nuevasEntidades) {
					html += this.#generadorDeComponentes(ent) || ''; // * El `||''` es para permitir que la función saltee resultados.
				}

				imagenAlcahuete.closest('.loading').remove();
				html += this.#generarUltimoComponente(nuevasEntidades.length);

				contenedor.innerHTML += html;
				this.pagina++;
			}).catch(error => {
				console.error('Error al desplazar:', error);
			});
		// TODO Feature: catch; y finally?
	}

	#generarUltimoComponente(cantidadDeEntidadesEnIteracion) {
		let html = '';

		// TODO Refactor: Poner algún componente de paginación en el frontend, que en su defecto obtenga la info del backend. Ver que no destruya ninguna renderización... quizá llevar la configuración del frontend AL backend? Suena a lo más oportuno, por mas que sea antiintuitivo...
		if (cantidadDeEntidadesEnIteracion == 0) {
			html += (this.pagina == 1 ? this.mensajeVacio : this.mensajeFinal).render();
		} else {
			html += `<div class="loading">`
			html += `<img loading="lazy" src="/loading.gif" onload="if(window.DesplazamientoInfinito?.instancias?.['${this.#id}'])DesplazamientoInfinito.instancias['${this.#id}'].navegar(event);else setTimeout(()=>this.src='/loading.gif?'+Math.random(),1000)">`;
			html += `</div>`
		}

		return html;
	}

	render() {
		return `<div id=${this.#id} class="desplazamiento-infinito">` + (this.entidadesIniciales || []).reduce((acc, ent) => acc + this.#generadorDeComponentes(ent), '') + this.#generarUltimoComponente(this.entidadesIniciales ? this.entidadesIniciales.length : -1 /* ! Si no ponemos -1, y no usamos entidadesIniciales, llega un cartel y nunca carga. */) + `</div>`;
	}
}

export { DesplazamientoInfinito };