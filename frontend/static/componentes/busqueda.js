import { Etiqueta } from './etiqueta.js'

class Busqueda{
    #etiquetas = [];

    constructor(etiquetas){

        if(etiquetas){
            this.#etiquetas = etiquetas;
        }
	}


    /* manejoBusqueda(event) {
        event.preventDefault();
        const searchTerm = event.target.elements.searchInput.value;
        // IMPLEMENTAR BUSQUEDA
        console.log('Búsqueda:', searchTerm);
    } */

    // TODO Feature: Etiquetas.
    // TODO Refactor: Estaría bueno usar las clases Formulario, Desplegable, Etiqueta, etc.

	render(){
        //  onsubmit="manejoBusqueda(event);"
		return`
        <div class="buscador">
            <form id="searchForm">
                <input class="input" type="text" name="searchInput" placeholder="Buscar..." />
            </form>
            ${this.#etiquetas.length > 0 ? '<div class="etiquetas">' + this.#etiquetas.map(e => new Etiqueta(e).render()).join('') + '</div>' : ''}
        </div>
        `;
	}
}

export {Busqueda};