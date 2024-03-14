import { SqS, addElement, createElement, gEt } from '../libs/c3tools.js';
import { PantallaNuevaPregunta} from '../pantallas/nueva-pregunta.js';

let pagina=PantallaNuevaPregunta(location.pathname,{usuario:window.usuarioActual},[]);
import inicializarListas from './inicializar-listas.js';

inicializarListas();

let espacioSugerencias=createElement('DIV',{	id:'nueva-pregunta-sugerencias'});
let dF=new DocumentFragment();
// TODO Refactor: Sacar este estilo en línea.
addElement(dF,['LABEL',{innerText:'Sugerencias basadas en lo escrito hasta el momento:',class:'label',style:{fontSize:'smaller'}}],espacioSugerencias);
gEt('nueva-pregunta').firstElementChild/* Fieldset */.firstElementChild/* Campo de título */.after(dF)

let peticionID=0;
function buscarSugerencias(valor){
	valor=valor.trim();
	if(!valor || valor.length<10){
		espacioSugerencias.innerHTML='';
		return;
	}
	
	let estaPeticionID=++peticionID;
	setTimeout(()=>{
		if(peticionID==estaPeticionID){
			fetch('/api/pregunta?formatoCorto&searchInput='+valor)
				.then(r=>r.json())
				.then(sug=>{
					if(peticionID==estaPeticionID){
						espacioSugerencias.innerHTML=sug.reduce((acc,pre)=>acc+new Pregunta(pre).render(),'');
					}
				})
		}
	},400/* TODO Refactor: DRY? (scripts/moderacion-preguntas-y-respuestas.js) ¿parametrizar?*/)
}
let campoTitulo=SqS('[name="titulo"]')
campoTitulo.oninput=function(){
	buscarSugerencias(this.value+' '+campoCuerpo.value)
};
let campoCuerpo=SqS('[name="cuerpo"]');
campoCuerpo.oninput=function(){
	buscarSugerencias(campoTitulo.value+' '+this.value);
}