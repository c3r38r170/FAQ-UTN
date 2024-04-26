// TODO Refactor: Unificar configuracion de paginacion; como cantidad por pagina
class Tabla {
	// Las tablas siempre serán de entidades
	// Específicamente: usuarios, posts (moderación), etiquetas...
	static instancias = {};

	#columnas = []; //{nombre,celda(entidad),clases:[]}
	entidades = [];
	#endpointPaginacion = '';
	#mostrarPaginacion = true;
	set endpointPaginacion(valor) {
		this.#endpointPaginacion = valor + (valor.includes('?') ? '&' : '?');
	};
	get endpointPaginacion() {
		return this.#endpointPaginacion;
	}
	pagina = 1;
	cantidadDePaginas;
	#id = '';

	constructor(id, endpoint, columnas, entidades = [], cantidadDePaginas = 1, mostrarPaginacion = true) {
		this.#id = id;
		this.endpointPaginacion = endpoint;
		this.#columnas = columnas;
		this.entidades = entidades;
		this.cantidadDePaginas = cantidadDePaginas
		this.#mostrarPaginacion = mostrarPaginacion;

		Tabla.instancias[id] = this;
	}

	iniciar() {
		// TODO	Feature: Conseguir la cantidad de páginas. Quizá con otra consulta...
		let tabla = document.getElementById(this.#id);
		let fieldset = tabla.querySelector('tfoot fieldset');
		if (this.#mostrarPaginacion)
			fieldset.className = 'fieldset-paginacion';

		fetch(this.#endpointPaginacion, {
			credentials: 'include',
			method: 'GET'
		})
			.then(res => {
				this.cantidadDePaginas = res.headers.get('untfaq-cantidad-paginas') ? res.headers.get('untfaq-cantidad-paginas') : 1;
				res.json()
					.then((nuevasEntidades) => {
						this.entidades = nuevasEntidades;

						// let tabla=form.closest('table');
						tabla.children[1] // body
							.innerHTML = this.generarCuerpo();

						fieldset.innerHTML = this.generarElementosPaginacion();
					}).catch(error => {
						console.error('Error con tabla:', error);
					})
					// TODO Feature: catch
					.finally(() => {
						fieldset.disabled = false;
					})
			})
	}

	navegar(e) {
		e.preventDefault();

		let form = e.target;
		let fieldset = form.firstElementChild;
		fieldset.disabled = true;

		this.pagina += (+e.submitter.value);
		let estaPagina = this.pagina;
		let url = this.endpointPaginacion + `pagina=${this.pagina - 1}`;

		fetch(url, {
			credentials: 'include',
			method: 'GET'
		})
			.then(res => res.json())
			/* new Promise((resolve, reject)=>{
				resolve(new Array(3).fill(null).map((n,i)=>(3*(this.#pagina-1)+i)));
			}) */
			.then((nuevasEntidades) => {
				if (estaPagina == this.pagina) {
					this.entidades = nuevasEntidades;

					let tabla = form.closest('table');
					tabla.children[1] // body
						.innerHTML = this.generarCuerpo();

					fieldset.innerHTML = this.generarElementosPaginacion();
				}
			}).catch(error => {
				console.error('Error con tabla:', error);
			})
			.finally(() => {
				fieldset.disabled = false;
			});
	}

	generarCuerpo() {
		let html = '';
		for (let ent of this.entidades) {
			html += '<tr>';
			for (let col of this.#columnas) {
				html += `<td ${col.clases ? 'class="' + col.clases.join(' ') + '"' : ''}>` + col.celda(ent) + '</td>'
			}
			html += '</tr>';
		}

		return html;
	}

	generarElementosPaginacion() {
		// TODO Refactor: Hacer new Boton() (y elemento texto?)
		return `<button class="boton-paginacion fa-solid fa-caret-left" name=accion value=-1 ` + (this.pagina == 1 ? ' disabled' : '') + `></button>
		<div class="accion-boton">Anterior</div>
		<span class="paginas">Página ${this.pagina} de ${this.cantidadDePaginas}</span>
		<div class="accion-boton">Siguiente</div>
		<button class="boton-paginacion fa-solid fa-caret-right" name=accion value=1 `+ (this.pagina == this.cantidadDePaginas ? ' disabled' : '') + `></button>`;
	}

	render() {
		let html = `<table id=${this.#id}><thead><tr>`;

		for (let col of this.#columnas) {
			html += `<th ${col.clases ? 'class="' + col.clases.join(' ') + '"' : ''}>` + col.nombre + '</th>';
		}

		html += '</tr></thead><tbody>';

		html += this.generarCuerpo();

		// TODO UX: Hacer lindo esto.
		html += "</tbody>"
		if (this.#mostrarPaginacion) {
			html += `<tfoot><tr><td colspan="${this.#columnas.length}">
	<form onsubmit="Tabla.instancias['${this.#id}'].navegar(event)">
		<fieldset>
			${this.generarElementosPaginacion()}
		</fieldset>
	</form>
</td></tr></tfoot></table>`;
		}
		html += "</table>"


		return html;
	}
}

export { Tabla };