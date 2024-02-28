import { PantallaNuevaPregunta} from '../pantallas/nueva-pregunta.js';
import {SqS,gEt,createElement} from '../libs/c3tools.js';
// TODO Refactor: RIP Desplegable?
import { Desplegable } from '../componentes/desplegable.js';
import BulmaTagsInput from 'https://cdn.jsdelivr.net/npm/@creativebulma/bulma-tagsinput@1.0.3/+esm';

let pagina=PantallaNuevaPregunta(location.pathname,{usuario:window.usuarioActual});

// TODO Feature: logica de frontend y etiquetas.
fetch('/api/etiqueta')
	.then(res=>res.json())
	.then(etiquetas=>{
		let etiquetasIndexadasPorCategoria={};
		for(let eti of etiquetas){
			if(!etiquetasIndexadasPorCategoria[eti.categoriaID]){
				etiquetasIndexadasPorCategoria[eti.categoriaID]={...eti.categoria,etiquetas:[eti]}
			}else{
				etiquetasIndexadasPorCategoria[eti.categoriaID].etiquetas.push(eti);
			}
		}

		let botonCrear=SqS('[type="submit"]',{from:gEt('nueva-pregunta')});

		// TODO UX: Label, que se vea como los demás.
		botonCrear.before(createElement(
					['SELECT',{
						dataset:{
							type:'tags'
							,placeholder:'Etiquetas'
							,selectable:"false"
						}
						,name:'etiquetasIDs'
						,multiple:true
						,required:true
						,children:etiquetas.map(({ID,descripcion,categoria:{categoriaID,descripcion:categoriaDescripcion}})=>['OPTION',{
							value:ID
							,innerText:`${categoriaDescripcion} - ${descripcion}`
						}])
					}]
		));
		
		// TODO UX: No te deja subir cosas si el input que se usa para buscar etiquetas está vacío, como que es requerido a pesar de que nqv.
		// TODO UX: Conciliar los estilos de las etiquetas con los que se definieron. Principalmente los colores de las categorías.
		/* Añadir un style que haga `.tags-input .dropdown-content a[data-value=`${ID}}`],.tags-input > .tag{color:${etiqueta.color}}` */
		BulmaTagsInput.attach();
	})