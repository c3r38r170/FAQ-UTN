import { Pagina, Modal, ComponenteLiteral, Titulo, Boton } from "../componentes/todos.js";

function formatearParrafos(texto){
	return texto.split("\n").reduce((acc,p)=>acc+`<p>${p.trim()}</p>`,'');
}

function crearPagina(ruta,usuario) {
	// ! En las imagenes se usa srcset="{direccion} {escala}" para hacer que las imágenes tengan un porcentaje de su tamaño original.
	// TODO UX: h2 o h3?
	let elementoTitulo1=['h2',5];
	let elementoTitulo2=['h3',6];

	let partesManual=[
		new Titulo(...elementoTitulo1,'Uso regular del sitio', '','uso-regular'),
		new ComponenteLiteral(()=>formatearParrafos(
			`Para encontrar la información que estás buscando, dirigite al <a href="/">inicio</a>, y usá los filtros de búsqueda.
			Hay 2 filtros; de <b>texto</b> y de <b>etiquetas</b>. El texto sirve para encontrar la información específica; y las etiquetas, para seleccionar en qué categorías buscar, filtrar por año, carrera, etc...
			Una vez definidos los filtros, usá el botón con una lupa para ver los resultados.
			<img srcset="filtros.png 1.4x">
			El sitio te va a mostrar las preguntas que hayan coincidido con tus filtros. Haciendo clic en el <b>título</b> de la pregunta, vas a acceder a todas las respuestas de la comunidad, donde esperamos que encuentres lo que estás buscando.
			<img srcset="pregunta.png 1.4x">
			`))
	]

	if(!usuario){
		partesManual.push(
			new ComponenteLiteral(()=>formatearParrafos(
				`En caso de no encontrar la información deseada, si sos un estudiante de la UTN te invitamos a registrarte usando tu DNI y realizar la pregunta vos mismo, con los detalles y las etiquetas correspondientes.
				<img srcset="registrarse.png 1.4x">
				<img srcset="formulario-registro.png 1.4x">
				Cuando ingreses, en esta misma página vas a poder encontrar información sobre cómo publicar tus preguntas, y sobre cómo aportar a la comunidad respondiendo las dudas de otras personas.`
			))
			,new Titulo(...elementoTitulo1,'¿Ya tenés una cuenta?','','ya-tenes-cuenta')
			,new ComponenteLiteral(()=>formatearParrafos(
				`Si ya tenés una cuenta, vas a poder ingresar con tu DNI y contraseña apretando el botón de "Ingresar".
				<img srcset="formulario-ingreso.png 1.4x">
				Si <b>olvidaste tu contraseña</b>, podés apretar el botón de "Olvidé mi Contraseña". Para recuperarla, vas a necesitar usar tu DNI y la misma dirección de correo electrónico que está registrada en tu cuenta.
				<img srcset="formulario-olvide.png 1.4x">`
				// TODO UX: ¿Algo como "Esperamos que esto te haya ayudado"?
			))
		);
	}else{
		if(usuario.perfil.permiso.ID>=1){// * Usuario regular
			partesManual.push(
				new Titulo(...elementoTitulo2,'Publicando una pregunta','','publicando-pregunta')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Si no encontrás la respuesta a tu pregunta, en la barra de navegación sobre el lateral izquierdo vas a encontrar el acceso al formulario de publicación de preguntas en el enlace "Preguntar".
					<img srcset="nav-1.png 1.4x">
					Esto te va a abrir un formulario. Para realizar una pregunta, debés rellenarlo con la siguiente información: <div class="content"><ul><li>Un título representativo</li><li>Una descripción de la duda o consulta</li><li>Etiquetas sobre los temas involucrados</li></ul></div>
					<img srcset="formulario-pregunta.png 1.4x">
					A medida que vayas escribiendo, el formulario va a estar buscando y mostrándote preguntas según lo que completes. ¡Asegurate de pegarles un vistazo! Quizás encuentres lo que necesitabas y no necesites volverlo a preguntar y esperar que alguien que lo sepa te responda.
					<img srcset="formulario-pregunta-sugerencias.png 1.4x">
					Si al publicarlo te das cuenta de que te equivocaste, no te preocupes. Tenés tiempo hasta que alguien haga una respuesta para editar la pregunta, o eliminarla en caso de que lo prefieras.
					<img srcset="formulario-pregunta-propia.png 1.4x">`
				))
				// * Respuestas
				,new Titulo(...elementoTitulo2,'Publicando una respuesta','','publicando-respuesta')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Al final de la lista de respuestas en cada pregunta, vas a encontrar el campo dedicado a realizar una nueva respuesta. Si querés responder la pregunta, añadir información, o realizar cualquier otro comentario; este es el medio para aportar tu granito de arena.
					<img srcset="formulario-respuesta.png 1.4x">
					<b>Estas respuestas (junto con las preguntas) son vistas por todos.</b> Estudiantes, profesores, administradores, incluso la gente que no está registrada; así que te invitamos a mantener un ambiente académico libre de agresiones y lleno de cooperación. :)
					Existe un sistema de moderación automática, y hay moderadores que se encargan de retirar todo el contenido reportado. El mecanismo de reportado de publicaciones será detallado en la siguiente sección.`
				))
				// * Reportes
				,new Titulo(...elementoTitulo2,'Reportando contenido','','reportando-contenido')
				,new ComponenteLiteral(()=>formatearParrafos(
					// TODO UX: Ver cómo otras páginas tratan este tema; usar su vocabulario.
					`Si ves algún mal comportamiento, o ante faltas de respeto o mensajes fuera de lugar, podés reportarlo con el menú al que se accede a través de los 3 puntos en la parte superior derecha de cada pregunta / respuesta.
					<img srcset="formulario-reporte.png 1.4x">
					Otra opción disponible, como se ve en la imagen, es la de reportar <b><u>preguntas</u> repetidas</b>. Esto es importante para mantener la información en un solo lugar, y no repetirla o peor, tener información errónea u obsoleta que pueda ser encontrada y usada por otros usuarios. El equipo de moderadores va a revisar los reportes, y ver si es necesario unificar la pregunta con otra idéntica o no.`
				))
				// * Suscripciones
				,new Titulo(...elementoTitulo1,'Suscripciones','','encabezado-suscripciones')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Al lado del botón de 3 puntos, está el botón de "Suscribirse". Al apretar este botón, serás notificado de cada <b>nuevo comentario</b> sobre esa pregunta. Al suscribirte, el botón cambia para ofrecer la opción de desuscripción. El día que esa pregunta ya no sea de relevancia, podrás desuscribirte para dejar de recibir las actualizaciones.
					<img srcset="boton-suscribirse.png 1.4x">
					<img srcset="boton-desuscribirse.png 1.4x">
					Cada vez que hacés una pregunta, automáticamente el sistema te suscribe a ella, para notificarte de las nuevas respuestas. Siempre vas a tener la opción de desuscribirte, incluso en tus propias respuestas.
					Podés encontrar y administrar todas tus suscripciones en el enlace en la barra lateral izquierda adecuadamente titulado "Suscripciones".`
				))
				// * Notificaciones
				,new Titulo(...elementoTitulo1,'Notificaciones','','encabezado-notificaciones')
				,new ComponenteLiteral(()=>formatearParrafos(
					`El panel de notificaciones se encuentra a la derecha de todas las pantallas. Las notificaciones son avisos de diferentes tipos:<div class="content"><ul><li>Votos en contenido publicado (preguntas o respuestas)</li><li>Nuevas respuestas en preguntas a las que te hayas suscripto</li><li>Nuevas preguntas bajo las etiquetas a las que te hayas suscripto</li><ul></div>
					Las notificaciones se separan en "Nuevas" y "Anteriores". Las notificaciones "Nuevas" son aquellas cuyo aviso aún no se ha visto. Si entrás a una pregunta de la que se te notificó por cualquier razón de las que mencionamos, todas las notificaciones involucradas pasarán a la sección "Anteriores".
					<img srcset="panel-notificaciones.png 1.4x">`
				))
				// * Perfiles
				// TODO Feature: Falta el reporte de personas. "Así como se pueden reportar (posts)..."
				,new Titulo(...elementoTitulo1,'Perfiles','','encabezado-perfiles')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Cada persona que veas en el sitio tiene un perfil. A primera vista, desde el contenido publicado, podés ver sus nombres, y roles asignados. Los roles corresponden al rol que cumplen estas personas en la comunidad educativa. Sea estudiante, profesor, o parte del staff.
					<img srcset="perfil-chiquito.png 1.4x">
					Haciendo clic en los nombres, podés acceder al perfil donde vas a encontrar su información personal, y todas las preguntas y respuestas que tengan publicadas.
					<img srcset="perfil-grande.png 1.4x">
					Accediento a tu propio perfil, a través de una pregunta, una respuesta, o el acceso en la barra de navegación a la izquierda llamado "Perfil"; vas a encontrar un espacio para ver tus datos personales. En este menú, vas a poder cambiar tu correo, tu foto de perfil, y tu contraseña cuando lo creas necesario. También vas a poder encontrar accesos para ver todas tus preguntas y todas tus respuestas a la izquierda.
					<img srcset="perfil-propio.png 1.4x">`
				))
			);
		}
		if(usuario.perfil.permiso.ID>=2){// * Moderador
			partesManual.push(
				// Moderar usuarios
				new Titulo(...elementoTitulo1,'Moderación','mt-5','moderar-posts')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Como moderador, tu responsabilidad es mantener "curado" el entorno académico y proteger a los demás usuarios o las discusiones de distintos agentes como usuarios fuera de control, <i>trolls</i> y <i>spam</i>.
					Para eso, es importante que conozcas las herramientas y poderes especiales con los que actuar llegado el caso. A continuación se describen las herramientas disponibles en nuestra plataforma.`
				))
				,new Titulo(...elementoTitulo2,'Moderar usuarios','mt-5','moderar-usuarios')
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
					<img srcset="motivo-desbloqueo-usuario.png 1.4x">
					Alternativamente, los usuarios se pueden bloquear desde sus perfiles.
					<img srcset="bloquear.png 1.4x">`
				))
					// Moderar preguntas y respuestas
				,new Titulo(...elementoTitulo2,'Moderar Preguntas y Respuestas','mt-5','moderar-posts')
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
				)),
				// Moderar posts borrados
				new Titulo(...elementoTitulo2,'Moderar Posts Borrados','mt-5','moderar-posts-borrados')
				,new ComponenteLiteral(()=>formatearParrafos(
					`Para acceder al panel de <a href="/moderacion/posts-borrados">Moderación de Posts Borrados</a> podés dirigirte al link "Moderación > Posts Borrados" en la barra de navegación izquierda.
					Ahí vas a encontrar una tabla con los posts que han sido borrados.
					<img srcset="posts-borrados.png 1.4x">
					En esta tabla, podrás ver la información sobre el Post y el usuario que lo creó.
					Si accionás en Restaurar (a la derecha de cada fila) aparecerá un cartel modal pidiendo una confirmación para la restauración del post.`
				))
			);
		}
		if(usuario.perfil.permiso.ID>=3){// * Administrador
			partesManual.push(
				// Administrar los 4 son iguales
				new Titulo(...elementoTitulo1,'Administración','mt-5','administracion')
				,new ComponenteLiteral(()=>
					`<p>Como administrador, tenés privilegios adicionales que te permiten gestionar las siguientes entidades:</p>
					<div class="content">
						<ul>
							<li><b>Perfiles</b>: Son los perfiles a los que puede estar asociado un usuario y cuentan con diferentes niveles de <b>Permisos</b>.
								<ul>
									<li>Agregar un nuevo Perfil</li>
									<li>Editar un Perfil existente</li>
									<li>Habilitar/Deshabilitar un Perfil existente</li>
								</ul>		
							</li>
							<li><b>Usuarios</b>: Los usuarios son la piedra angular de nuestra comunidad en línea. Cada usuario contribuye al intercambio de información, discusiones y colaboración en nuestro sitio web, creando así una experiencia enriquecedora y dinámica para todos los miembros.
								<ul>
									<li>Agregar un nuevo Usuario</li>
									<li>Editar un Usuario existente</li>
									<li>Bloquear/Desbloquear un Usuario existente</li>
								</ul>	
							</li>
							<li><b>Categorías</b>: Las categorías son una forma de organizar y clasificar el contenido relacionado. Cada Categoría puede tener varias etiquetas asociadas a ella.
								<ul>
									<li>Agregar una nueva Categoría</li>
									<li>Editar una Categoría existente</li>
									<li>Habilitar/Deshabilitar una Categoría existente</li>
								</ul>	
							</li>
							<li><b>Etiquetas</b>: Las etiquetas son términos más específicos que se utilizan para etiquetar el contenido dentro de una categoría.
								<ul>
									<li>Agregar una nueva Etiqueta</li>
									<li>Editar una Etiqueta existente</li>
									<li>Habilitar/Deshabilitar una Etiqueta existente</li>
								</ul>	
							</li>
						</ul>
					</div>
					<p>Los usuarios bloqueados no pueden acceder al sistema. Las entidades deshabilitadas ya no aparecen en los formularios.</p>`
				),
				new Titulo(...elementoTitulo2,'Administrar Perfiles','mt-5','administracion-perfiles'),
				new ComponenteLiteral(()=>formatearParrafos(
					`En <a href="/administracion/perfiles">Administración de Perfiles</a> vas a encontrar la siguiente tabla:
					<img srcset="perfiles.png 1.4x">
					Ahí podés accionar en el boton Editar, o en la perilla para Habilitar/Deshabilitar un Perfil. Para crear un Perfil nuevo presiona el botón "Agregar" al final de la tabla y completá el formulario.
					<img srcset="agregar.png 1.4x">
					<img srcset="agregar-perfil.png 1.4x">
					`
				)),
				new Titulo(...elementoTitulo2,'Administrar Usuarios','mt-5','administracion-usuarios'),
				new ComponenteLiteral(()=>formatearParrafos(
					`En <a href="/administracion/usuarios">Administración de Usuarios</a> vas a encontrar la siguiente tabla:
					<img srcset="tabla-usuarios.png 1.4x">
					Ahí podés accionar en el boton "Editar", o en la perilla para Bloquear/Desbloquear un Usuario. Para crear un Usuario nuevo presioná el botón "Agregar" al final de la tabla y completá el formulario.
					<img srcset="agregar.png 1.4x">
					<img srcset="agregar-usuario.png 1.4x">`
				)),
				new Titulo(...elementoTitulo2,'Administrar Categorías','mt-5','administracion-categorias'),
				new ComponenteLiteral(()=>formatearParrafos(
					`En <a href="/administracion/categorias">Administración de Categorías</a> vas a encontrar la siguiente tabla:
					<img srcset="tabla-categorias.png 1.4x">
					Ahí podés accionar en el boton Editar, o en la perilla para Habilitar/Deshabilitar una Categoría. Para crear una Categoría nueva presiona el botón "Agregar" al final de la tabla y completá el formulario.
					<img srcset="agregar.png 1.4x">
					<img srcset="formulario-categoria.png 1.4x">
					`
				)),
				new Titulo(...elementoTitulo2,'Administrar Etiquetas','mt-5','administracion-etiquetas'),
				new ComponenteLiteral(()=>formatearParrafos(
					`En <a href="/administracion/etiquetas">Administración de Etiquetas</a> vas a encontrar la siguiente tabla:
					<img srcset="tabla-etiquetas.png 1.4x">
					Ahí podés accionar en el boton Editar, o en la perilla para Habilitar/Deshabilitar una Etiqueta. Para crear una Etiqueta nueva presiona el botón "Agregar" al final de la tabla y completá el formulario.
					<img srcset="agregar.png 1.4x">
					<img srcset="formulario-etiqueta.png 1.4x">
					`
				))
				
				// * Descripción de los parámetros
				,new Titulo(...elementoTitulo1,'Parámetros','','encabezado-parametros')
				,new ComponenteLiteral(()=>/* formatearParrafos( */
					`<p>Finalmente, hay disponibles una serie de parámetros que dictan cómo funciona la aplicación. A continuación, facilitamos una descripción de cada parámetro y lo que afecta, junto con sus valores predeterminados.</p>
					<p>Los parámetros sobre la Inteligencia Artificial tienen en cuenta que el servicio remoto responderá con un número entre 0 y 100 al contenido que se le envía (cada pregunta y respuesta), donde 0 es completamente inapropiado y 100 es completamente permitible, sin aceptar insultos.</p>
					<div class="content">
					<table id="tabla-parametros"><thead><tr><th>Parámetro</th><th>Descripción</th><th>Valor Recomendado</th></tr></thead>
						<tbody><tr><td>Resultados por página</td><td>La cantidad de resultados que vienen por segmentación en tablas, y en las pantallas donde el usuario reciba contenido al desplazarse (preguntas, respuestas, notificaciones...)</td><td>10</td></tr>
						<tr><td>Moderar con IA</td><td>Activa o desactiva el uso del servicio de Inteligencia Artificial para moderar el contenido nuevo. Si se desactiva, el contenido no será moderado en absoluto.</td><td>Sí</td></tr>
						<tr><td>Confianza para rechazar post</td><td>Límite superior de cuán apropiado debe ser una publicación para ser rechazada por el servicio de Inteligencia Artificial. A mayor número, más restrictivo es el módulo.</td><td>40</td></tr>
						<tr><td>Confianza para reportar post</td><td>Límite superior de cuán apropiado debe ser una publicación para permitirla, pero crear un reporte para moderación humana. A mayor número, más contenido será reportado.</td><td>70</td></tr></tbody></table>
					</div>
					`
				/* ) */)
			);
		}
	}

	let tablaDeContenidos='<li><big>Tabla de Contenidos.</big>';
	let adentro=false;
	for(let e of partesManual){
		if(e.titulo){ // * E' `Título`.
			if(e.elemento==elementoTitulo1[0]){
				if(adentro){
					tablaDeContenidos+='</ul>'
					adentro=false;
				}
				tablaDeContenidos+=`</li><li><a href="#${e.id}">${e.titulo}</a>`;
			}else{ // * Titulo 2
				if(!adentro){
					tablaDeContenidos+='<ul>'
					adentro=true;
				}
				tablaDeContenidos+=`<li><a href="#${e.id}">${e.titulo}</a></li>`;
			}
		}
	}
	tablaDeContenidos+='</li>';
	// TODO Refactor: Hubiera estado bueno poder usar Boton acá.
	partesManual.push(new ComponenteLiteral(()=>'<a href="/" class="button is-link is-rounded">Volver al inicio</a>'));

  return new Pagina({
		titulo: "FAQ UTN - Ayuda / Manual de Usuarios",
    sesion: {usuario},
		ruta,
    partes: [
			new Modal("General", "modal-general")
			,new ComponenteLiteral(()=>`<div id="tabla-de-contenidos" class="content"><ul>${tablaDeContenidos}</ul></div>`)
			,...partesManual
		],
  });
}

export { crearPagina as PantallaManual };