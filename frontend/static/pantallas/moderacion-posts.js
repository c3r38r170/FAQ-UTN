import { Pagina, Titulo, Formulario, Tabla,Fecha, ChipUsuario, Modal, Respuesta, Pregunta, ComponenteLiteral } from '../componentes/todos.js'

function crearPantalla(ruta,sesion){
	let tabla=new Tabla('moderar-posts','/api/post/reporte',[
		{
			nombre:'Post'
			,celda:({reportado})=>[
				new ChipUsuario(reportado.duenio)
				,new ComponenteLiteral(()=>`<span class="pregunta">${reportado.respuestaID?'Respuesta a ':''}<a href="/pregunta/${reportado.preguntaID}" class="titulo">${reportado.titulo}</a></span>`
					+`<div class="cuerpo">${reportado.cuerpo}</div>`)
			].reduce((acc,el)=>acc+el.render(),'')
		}
		,{
			nombre:'Reportes'
			,celda:(rep)=>`Última fecha: <b>${new Fecha(rep.fecha,Fecha.CORTA).render()}</b>Cantidad: <b>${rep.cantidad}</b>`
			,clases:['centrado']
		}
		,{
			nombre:'Acciones'
			,celda:(rep)=>'<button></button>'
		}
	]);

	let pagina = new Pagina({
    ruta: ruta,
    titulo: 'Moderación - Preguntas y Respuestas Reportadas',
    sesion,
		partes:[
			// TODO Feature: Considerar poner una barra de búsqueda.
			tabla
		]
  });
	return pagina;
}

export {crearPantalla as PantallaModeracionPosts};