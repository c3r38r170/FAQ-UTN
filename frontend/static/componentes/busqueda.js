import { Etiqueta } from './etiqueta.js'

class Busqueda{
    #etiquetas= [
        {etiqueta: 'mesas de examen'},
        {etiqueta: 'excepcion'},
        {etiqueta: 'apuntes'},
		{etiqueta: 'tp'}
    ]
	render(){
		return`
        <div class="buscador">
            <div class="titulo">Buscar</div>
            <input class="input" type="text" placeholder="Buscar...">
            <div id="etiquetas">
            ${this.#etiquetas.map(e=> new Etiqueta(e).render()).join('')}
            </div>  
        </div>
        `;
	}
}

export {Busqueda};