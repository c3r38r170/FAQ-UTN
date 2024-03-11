import { Etiqueta, Formulario } from './todos.js'

class Busqueda{
    // #etiquetas = [];
    #formulario=null;

    constructor({valorBusqueda,categorias,etiquetasSeleccionadas}={}){
        let campos=[
            { name:'searchInput', textoEtiqueta:'Filtro', placeholder:'Buscar...', value:valorBusqueda, required:false }
        ]

        if(categorias){
            // this.#etiquetas = etiquetas;
            let opcionesDeListado={
                name:'etiquetas'
                ,textoEtiqueta:'Etiquetas'
                ,type:'lista-etiquetas'
                ,required:false
            }
            // TODO Refactor: DRY
            if(etiquetasSeleccionadas){
                opcionesDeListado.value=etiquetasSeleccionadas;
                opcionesDeListado.extra=categorias.map(cat => cat.etiquetas.map(eti => `<option value=${eti.ID} data-color="${cat.color}" data-categoria="${cat.descripcion}" ${etiquetasSeleccionadas.some((ID)=>ID==eti.ID) ? 'selected' : ''}>${cat.descripcion} - ${eti.descripcion}</option>`)).flat().join('')
            }else{
                opcionesDeListado.extra=categorias.map(cat => cat.etiquetas.map(eti => `<option value=${eti.ID} data-color="${cat.color}" data-categoria="${cat.descripcion}">${cat.descripcion} - ${eti.descripcion}</option>`)).flat().join('')
            }

            campos.push(opcionesDeListado);	
        }

        this.#formulario=new Formulario('searchForm',null,campos,null,{
            clasesBoton:'is-primary mt-3 fa fa-magnifying-glass'
        })
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
            ${this.#formulario.render()}
        </div>
        `;
        /* return`
        <div class="buscador">
            <form id="searchForm">
                <input class="input" type="text" name="searchInput" placeholder="Buscar..." />
            </form>
            ${this.#etiquetas.length > 0 ? '<div class="etiquetas">' + this.#etiquetas.map(e => new Etiqueta(e).render()).join('') + '</div>' : ''}
        </div>
        `; */
	}
}

export {Busqueda};