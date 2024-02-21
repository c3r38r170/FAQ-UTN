import { gEt,SqS } from '../libs/c3tools.js';
import { PantallaAdministracionUsuarios } from "../pantallas/administracion-usuarios.js";
import { Titulo,Formulario, ComponenteLiteral } from '../componentes/todos.js';

let pagina= PantallaAdministracionUsuarios(location.pathname, {usuario:window.usuarioActual});
let modal=pagina.partes[0];
let tabla=pagina.partes[1];
tabla/* ! Tabla */.iniciar();

let modalElemento=gEt('administrar-usuarios-modal');

// TODO Feature: Que al volver para atrás se mantenga la paginación. localStorage? dejar que el caché de chrome se encargue?

gEt('administrar-usuarios').onchange=e=>{
	let checkbox=e.target;
	if(checkbox.type!='checkbox'){
		return;
	}

	// * No chequeamos estado de la checkbox porque debería ser consistente.
	checkbox.disabled = true;

	let DNI=checkbox.value;

	let indiceUsuarioElegido=tabla.entidades.findIndex(({DNI: esteDNI})=>esteDNI==DNI);
	let usuarioElegido=tabla.entidades[indiceUsuarioElegido];
	// ! Se deben crear nuevos formularios porque el valor del DNI del elegido estará en el indice, en el endpoint, y en más lógica dentro del manipulador de respuesta.
	if(usuarioElegido.bloqueosRecibidos.length){ // * Se desea desbloquear
		modal.titulo='Desbloquear a '+usuarioElegido.nombre;
		modal.contenido=[
			// TODO Feature: Mostrar razón del desbloqueo, preguntar si se está seguro.
			new ComponenteLiteral(()=>`<big><b><p>¿Estás seguro?</p></b></big> <p><i>${usuarioElegido.nombre} fue bloqueado con el siguiente motivo:</i><br/>${usuarioElegido.bloqueosRecibidos[0].motivo}</p><br/>`),
			new Formulario('administracion-usuarios-desbloquear',`/api/usuario/${DNI}/bloqueo`,[
				{name:'motivo',textoEtiqueta:'Motivo del desbloqueo:',type:'textarea'}
			],(txt,info)=>{
				if(info.ok){
					if(tabla.entidades[indiceUsuarioElegido].DNI==DNI){ // * Si se sigue en la misma página
						// ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
						checkbox.checked=true;
						checkbox.disabled=false;
	
						// TODO Refactor: Ver si los que no están bloqueados traen un array vacio o directamente no traen la propiedad.
						tabla.entidades[indiceUsuarioElegido].bloqueosRecibidos=[];
					}
				}else{
					// TODO UX: Mejores alertas
					alert(`Error ${info.codigo}: ${txt}`);
				}
			},{
				verbo:'DELETE'
				,textoEnviar:'Registrar motivo y desbloquear'
				,clasesBoton:'button is-link is-rounded mt-3'
			})
		];
	}else{ // * Se desea bloquear
		modal.titulo='Bloquear a '+usuarioElegido.nombre;
		modal.contenido=[
					new Formulario('administracion-usuarios-desbloquear',`/api/usuario/${DNI}/bloqueo`,[
						{name:'motivo',textoEtiqueta:'Motivo del bloqueo:',type:'textarea'}
					],(txt,info)=>{
						if(info.ok){
							if(tabla.entidades[indiceUsuarioElegido].DNI==DNI){ // * Si se sigue en la misma página
								// ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
								checkbox.checked=true;
								checkbox.disabled=false;

								tabla.entidades[indiceUsuarioElegido].bloqueosRecibidos=[{motivo:SqS('#administracion-usuarios-desbloquear [name="motivo"]').value}];
							}
						}else{
							// TODO UX: Mejores alertas
							alert(`Error ${info.codigo}: ${txt}`);
						}
					},{
						verbo:'POST'
						,textoEnviar:'Registrar motivo y bloquear'
						,clasesBoton:'button is-link is-rounded mt-3'
					})
			];
	}
	modal.redibujar();
	modalElemento.classList.add('is-active');

	// TODO Feature: Volver al valor anterior si se cancela el formulario.
	checkbox.disabled=false;
}