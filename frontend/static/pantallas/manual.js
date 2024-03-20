import { Pagina, Modal, ComponenteLiteral, Titulo, Boton } from "../componentes/todos.js";

function formatearParrafos(texto){
	return texto.split("\n").reduce((acc,p)=>acc+`<p>${p.trim()}</p>`,'');
}

function crearPagina(ruta,usuario) {
	// ! En las imagenes se usa srcset="{direccion} {escala}" para hacer que las imágenes tengan un porcentaje de su tamaño original.
	// TODO UX: h2 o h3?
	let partesManual=[
		new Titulo('h2',5,'Uso regular del sitio'),
		new ComponenteLiteral(()=>formatearParrafos(
			`Para encontrar la información que estás buscando, dirigite al <a href="/">inicio</a>, y usá los filtros de búsqueda.
			Hay 2 filtros; de <b>texto</b> y de <b>etiquetas</b>. El texto sirve para encontrar la información específica; y las etiquetas, para seleccionar en qué categorías buscar, filtrar por año, carrera, etc...
			Una vez definidos los filtros, usá el botón con una lupa para ver los resultados.
			<img srcset="filtros.png 1.4x">`))
	]

	if(!usuario){
		partesManual.push(
			new ComponenteLiteral(()=>formatearParrafos(
				`En caso de no encontrar la información deseada, si sos un estudiante de la UTN te invitamos a registrarte usando tu DNI y realizar la pregunta vos mismo, con las etiquetas correspondientes.
				<img srcset="registrarse.png 1.4x">
				<img srcset="formulario-registro.png 1.4x">
				Cuando ingreses, en esta misma página vas a poder encontrar información sobre cómo publicar tus preguntas, y sobre cómo aportar a la comunidad respondiendo las dudas de otras personas.`
			))
			,new Titulo('h2',5,'¿Ya tenés una cuenta?')
			,new ComponenteLiteral(()=>formatearParrafos(
				`Si ya tenés una cuenta, vas a poder ingresar con tu DNI y contraseña apretando el botón de "Ingresar".
				<img srcset="formulario-ingreso.png 1.4x">
				Si <b>olvidaste tu contraseña</b>, podés apretar el botón de "Olvidé mi Contraseña". Para recuperarla, vas a necesitar usar tu DNI y la misma dirección de correo electrónico que está registrado en tu cuenta.
				<img srcset="formulario-olvide.png 1.4x">`
				// TODO UX: ¿Algo como "Esperamos que esto te haya ayudado"?
			))
		);
	}else{
		if(usuario.perfil.permiso.ID>=1){// * Usuario regular
			partesManual.push(
				new Titulo('h2',5,'Publicando una pregunta')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Si no encontrás la respuesta a tu pregunta, en la barra lateral izquierda vas a encontrar el acceso al formulario de publicación de preguntas.
					<img srcset="nav-1.png 1.4x">
					Para realizar una pregunta, debés ponerle: <div class="content"><ul><li>Un título representativo</li><li>Una descripción de la duda o consulta</li><li>Etiquetas sobre los temas involucrados</li><ul></div>
					<img srcset="formulario-pregunta.png 1.4x">
					Si al publicarlo te das cuenta de que te equivocaste, no te preocupes. Tenés tiempo hasta que alguien haga una respuesta para editar la pregunta, o eliminarla en caso de que lo prefieras.
					<img srcset="formulario-pregunta-propia.png 1.4x">`
				))
				// Respuestas
				,new Titulo('h2',5,'Publicando una respuesta')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Si querés responder una pregunta, añadir información, o realizar cualquier otro comentario; en la página de cada respuesta vas a tener un formulario para aportar tu granito de arena.
					<img srcset="formulario-respuesta.png 1.4x">
					<b>Estas respuestas (junto con las preguntas) son vistas por todos.</b> Estudiantes, profesores, administradores, incluso la gente que no está registrada.
					Existe un sistema de moderación automática, y hay moderadores que se encargan de retirar todo el contenido reportado. El mecanismo de reportado de publicaciones será detallado en la siguiente sección.`
				))
				// Reportes
				,new Titulo('h2',5,'Reportando contenido')
				,new ComponenteLiteral(()=>formatearParrafos(
					// TODO UX: Ver cómo otras páginas tratan este tema; usar su vocabulario.
					`Si ves algún mal comportamiento, y ante faltas de respeto o mensajes fuera de lugar, podés reportarlo con el menú al que se accede a través de los 3 puntos en la parte superior derecha de cada pregunta / respuesta.
					<img srcset="formulario-reporte.png 1.4x">
					Otra opción disponible, como se ve en la imagen, es la de reportar <b><u>preguntas</u> repetidas</b>. Esto es importante para mantener la información en un solo lugar, y no repetirla o peor, tener información errónea u obsoleta que pueda ser encontrada y usada por otros usuarios. El equipo de moderadores va a revisar los reportes, y decidir si unficar la pregunta es necesario o no.`
				))
				// Suscripciones
				,new Titulo('h2',5,'Suscripciones')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Al lado del botón de 3 puntos, está el botón de "Suscribirse". Al apretar este botón, serás notificado de cada nuevo comentario sobre esa pregunta. Al suscribirte, el botón cambia para ofrecer la opción de desuscripción. El día que esa pregunta ya no sea de relevancia, podrás desuscribirte para dejar de recibir las actualizaciones.
					
					Cada vez que hacés una pregunta, automáticamente el sistema te suscribe a ella. Siempre vas a tener la opción de desuscribirte, incluso en tus propias respuestas.`
				))
				//Notificaciones
				// Perfiles
			);
		}
		if(usuario.perfil.permiso.ID>=2){// * Moderador
			partesManual.push(new ComponenteLiteral(()=>{}));
			// Moderar usuarios
			// Moderar preguntas y respuestas
		}
		if(usuario.perfil.permiso.ID>=3){// * Administrador
			partesManual.push(new ComponenteLiteral(()=>{}));
			// Administrar los 4 son iguales
				// La busqueda en usuarios
			// Descripción de los parámetros
		}
	}
	
	// TODO UX: Tabla de contenidos. Mapear los títulos.

	// TODO Refactor: Hubiera estado bueno poder usar Boton acá.
	partesManual.push(new ComponenteLiteral(()=>'<a href="/" class="button is-link is-rounded">Volver al inicio</a>'));

  return new Pagina({
		titulo: "FAQ UTN - Ayuda / Manual de Usuarios",
    sesion: {usuario},
		ruta,
    partes: [
			new Modal("General", "modal-general")
			,...partesManual
		],
  });
}

export { crearPagina as PantallaManual };