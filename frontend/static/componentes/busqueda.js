import { Etiqueta } from './etiqueta.js'

class Busqueda{
    #etiquetas= [
        {etiqueta: 'mesas de examen'},
        {etiqueta: 'excepcion'},
        {etiqueta: 'apuntes'},
		{etiqueta: 'tp'}
    ]


    manejoBusqueda(event) {
        event.preventDefault();
        const searchTerm = event.target.elements.searchInput.value;
        // IMPLEMENTAR BUSQUEDA
        console.log('Búsqueda:', searchTerm);
    }


	render(){
		return`
        <div class="buscador">
            <div class="titulo">Buscar</div>
            <form id="searchForm" onsubmit="manejoBusqueda(event);">
                <input class="input" type="text" name="searchInput" placeholder="Buscar..." />
            </form>
            <div id="etiquetas">
                ${this.#etiquetas.map(e => new Etiqueta(e).render()).join('')}
            </div>  
        </div>
        `;
	}
}

export {Busqueda};