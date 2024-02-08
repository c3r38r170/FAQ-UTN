import { Etiqueta } from './etiqueta.js'

class Busqueda{
    #etiquetas = [];

    constructor(etiquetas){

        if(etiquetas){
            this.#etiquetas = etiquetas;
        }
	}


    manejoBusqueda(event) {
        event.preventDefault();
        const searchTerm = event.target.elements.searchInput.value;
        // IMPLEMENTAR BUSQUEDA
        console.log('Búsqueda:', searchTerm);
    }


	render(){
		return`
        <div class="buscador">
            <form id="searchForm" onsubmit="manejoBusqueda(event);">
                <input class="input" type="text" name="searchInput" placeholder="Buscar..." />
            </form>
            <div class="etiquetas">
                ${this.#etiquetas.lenght > 0 ? this.#etiquetas.map(e => new Etiqueta(e).render()).join('') : ''}
            </div>  
        </div>
        `;
	}
}

export {Busqueda};