import { Formulario } from './todos.js'

class Busqueda{
    #formulario=null;

    constructor({valorBusqueda,categorias,etiquetasSeleccionadas}={}){
        let campos=[
            { name:'searchInput', textoEtiqueta:'Filtro', placeholder:'Buscar...', value:valorBusqueda, required:false }
        ]

        if(categorias){
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
            ,textoEnviar:''
        })
	}

	render(){
		return`
        <div class="buscador">
            ${this.#formulario.render()}
        </div>
        `;
	}
}

export {Busqueda};