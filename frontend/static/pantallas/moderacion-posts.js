import { Pagina, Titulo, Formulario, Tabla,Fecha, ChipUsuario, Modal, Respuesta, Pregunta } from '../componentes/todos.js'

function crearPantalla(ruta,sesion){
	let tabla=new Tabla('moderar-posts','/api/post/reporte',[
		{
			nombre:'Post'
			,celda:(rep)=>(rep.reportado.respuestaID?
				new Respuesta({ ID:rep.reportado.respuestaID, ...rep.reportado})
				:new Pregunta({ID:rep.reportado.preguntaID,...rep.reportado})).render()
		}
		,{
			nombre:'Reportes'
			,celda:(rep)=>`Última fecha: ${new Fecha(rep.fecha,Fecha.CORTA).render()}, Cantidad: ${rep.cantidad}`
		}
		,{
			nombre:'Acciones'
			,celda:(rep)=>'<button></button>'
		}
	]);

	let pagina = new Pagina({
    ruta: ruta,
    titulo: 'Moderación - Preguntas y Respuestas Reportadas',
    sesion: sesion,
		partes:[
			// TODO Feature: Considerar poner una barra de búsqueda.
			tabla
		]
  });
	return pagina;
}

export {crearPantalla as PantallaModeracionPosts};