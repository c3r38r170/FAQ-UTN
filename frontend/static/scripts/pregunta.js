import { PantallaNuevaPregunta} from '../pantallas/nueva-pregunta.js';
import {SqS,gEt,createElement,addElement} from '../libs/c3tools.js';
// TODO Refactor: RIP Desplegable?
import { Desplegable } from '../componentes/desplegable.js';
import BulmaTagsInput from 'https://cdn.jsdelivr.net/npm/@creativebulma/bulma-tagsinput@1.0.3/+esm';

let pagina=PantallaNuevaPregunta(location.pathname,{usuario:window.usuarioActual});

fetch('/api/categorias?etiquetas=1')
	.then(res=>res.json())
	.then(categorias=>{
		let optionsEtiquetas=[];
		let htmlStyle='';

		for(let cat of categorias){
			htmlStyle+=`[data-text^="${cat.descripcion}"]`;

			for(let eti of cat.etiquetas){
				optionsEtiquetas.push(['OPTION',{
					value:eti.ID
					,dataset:{
						categoriaID:cat.ID
					}
					,innerText:`${cat.descripcion} - ${eti.descripcion}`
				}]);

				htmlStyle+=`, .tag.is-rounded[data-value="${eti.ID}"]`;
			}
			
			htmlStyle+=`{background-color:${cat.color}}`;
		}

		let botonCrear=SqS('[type="submit"]',{from:gEt('nueva-pregunta')});
		botonCrear.before(createElement(
			[
				'LABEL',{
					class:'label',
					children: [
						['SPAN',{innerText:'Etiquetas'}],
						['SELECT',{
							dataset:{
								type:'tags'
								,placeholder:'Etiquetas'
								,selectable:"false"
							}
							,name:'etiquetasIDs'
							,multiple:true
							,required:true
							,children:optionsEtiquetas
						}]
					]
				}
			]
		));
		
		addElement(SqS('head'),['STYLE',{innerHTML:htmlStyle}]);

		// TODO UX: Conciliar los estilos de las etiquetas con los que se definieron.
		BulmaTagsInput.attach();
		SqS('.tags-input.is-filter > input').required=false;
	})