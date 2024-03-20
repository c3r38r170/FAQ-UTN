import { Pagina, Modal, ComponenteLiteral, Titulo, Boton } from "../componentes/todos.js";

function formatearParrafos(texto){
	return texto.split("\n").reduce((acc,p)=>acc+`<p>${p.trim()}</p>`,'');
}

function crearPagina(ruta,usuario) {
	// ! En las imagenes se usa srcset="{direccion} {escala}" para hacer que las imágenes tengan un porcentaje de su tamaño original.
	// TODO UX: Tabla de contenidos.
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
					``
				))
				// Suscripciones
				// Perfiles
			);
		}
		if(usuario.perfil.permiso.ID>=2){// * Moderador
			partesManual.push(
				// Moderar usuarios
				new Titulo('h2',5,'Moderar usuarios')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Los usuarios moderadores tienen la capacidad de bloquear o desbloquear cuentas según sea necesario.
					Si necesitás moderar a algún usuario podés visitar <a href="/moderacion/usuarios">Moderación de usuarios</a> o dirigirte al link "Moderación > Usuarios" en la barra de navegación izquierda.
					Ahí vas a encontrar una tabla con los usuarios reportados.
					<img srcset="tabla-moderacion-usuarios.png 1.4x">
					En esta tabla, verás la siguiente información sobre cada usuario:
					<div class="content">
						<ul>
							<li>Nombre de Usuario: El nombre del usuario en el sistema.</li>
							<li>Cantidad de Reportes: Número de veces que ha sido reportado.</li>
							<li>Último reporte: La fecha y hora del último reporte recibido.</li>
							<li>Bloqueado: Podés ver el estado en que se encuentra el usuario.</li>
						</ul>
					</div>
					Si accionas en bloquear a un usuario aparecerá un cartel modal para que indiques el motivo de bloqueo del usuario y así podrás registrar el bloqueo.
					<img srcset="motivo-bloqueo-usuario.png 1.4x">
					Por otro lado si quieres desbloquear un usuario que se encuentra bloqueado podrás indicar el motivo de desbloqueo  y así de esta manera registrar el desbloqueo.
					<img srcset="motivo-desbloqueo-usuario.png 1.4x">`
				)),
				// Moderar preguntas y respuestas
				new Titulo('h2',5,'Moderar Preguntas y Respuestas')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Para acceder al panel de <a href="/moderacion/preguntas-y-respuestas">Moderación de Preguntas y Respuestas</a> podés dirigirte al link "Moderación > Preguntas y Respuestas" en la barra de navegación izquierda.
					Ahí vas a encontrar una tabla con los posts reportados.
					<img srcset="tabla-moderacion-preguntas-y-respuestas.png 1.4x">
					En esta tabla, verás la siguiente información sobre cada Post:
					<div class="content">
						<ul>
							<li>Post: El post reportado. Puede ser o una Pregunta o una Respuesta.</li>
							<li>Reportes: Fecha del último reporte y el número de veces que ha sido reportado.</li>
							<li>Acciones: Hay 2 acciones disponibles. Unificar en el caso de que sea una Pregunta o Eliminar.</li>
						</ul>
					</div>
					Si accionas en Eliminar un Post aparecerá un cartel modal pidiendo una confirmación para la eliminación del post.
					<img srcset="eliminar-post.png 1.4x">
					Por otro lado el modal de Unificar será parecido al siguiente y te permitira seleccionar de una lista, una pregunta de otro usuario para poder unificar las dos preguntas en cuestión. Esto permite que el contenido del sitio no sea redundante.
					<img srcset="unificar-pregunta.png 1.4x">`
				))
			
			);
			
			
		}
		if(usuario.perfil.permiso.ID>=3){// * Administrador
			partesManual.push(new ComponenteLiteral(()=>{}));
			// Administrar los 4 son iguales
				// La busqueda en usuarios
			// Descripción de los parámetros
		}
	}

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