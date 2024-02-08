import { PantallaNuevaPregunta} from '../pantallas/nueva-pregunta.js';
import {SqS,gEt,createElement} from '../libs/c3tools.js';
import { Desplegable } from '../componentes/desplegable.js';

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

		/*let contenedorDeEtiquetas=createElement('DIV',{class:'contenedor-de-etiquetas'});
		contenedorDeEtiquetas.innerHTML=Object.entries(etiquetasIndexadasPorCategoria).reduce((acc,[ID,categoria])=>acc+(new Desplegable('entradas-etiquetas',categoria.descripcion,categoria.etiquetas.map(({ID,descripcion})=>({
			descripcion
			,value:ID
		})),{tipoPorDefecto:'option'})).render(),'');
		botonCrear.before(contenedorDeEtiquetas);
		console.log(botonCrear,botonCrear.previousElementSibling); */

		// TODO Feature: Hacer que ande.
		botonCrear.before(createElement([
			'DIV',{
				id:'nueva-pregunta-etiquetas',
				children:Object.entries(etiquetasIndexadasPorCategoria).map(([ID,categoria])=>['LABEL',{
					classList:['label','select','is-multiple'],
					children:[
						['SPAN',{innerText:categoria.descripcion}]
						,['SELECT',{
							multiple:true,
							children:categoria.etiquetas.map(({ID,descripcion})=>['OPTION',{innerText:descripcion,value:ID}])
						}]
					]
				}])
			}
		]));
	})