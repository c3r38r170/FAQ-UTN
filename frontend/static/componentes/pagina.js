// TODO Refactor: Chupar todo de todos.js
import { Modal } from "./modal.js";
import { Boton } from "./boton.js";
import { Breadcrumb } from "./breadcrumb.js";
import { Navegacion } from "./navegacion.js";
import { Notificacion } from "./notificacion.js";
import { Formulario } from './formulario.js';
import { ChipUsuario, DesplazamientoInfinito, MensajeInterfaz, Titulo } from './todos.js'

// TODO Feature: Tirar errores en los constructores con parámetros necesarios 
// TODO Refactor: Cambiar a Pantalla. Colisiona con el concepto de página de los modelos.
class Pagina {
	/* Idealmente, quizá la página podría serializarse, incluirse en las globales, y deserializarse en el frontend. Un ejemplo de algo que nos permitiría esto sería https://github.com/erossignon/serialijse (aunque no parece soportar las propiedades privadas)
	De esta manera nos ahorramos la carpeta pantallas, y el archivo de visibilizar-clases. */

	#ruta = '';
	// TODO Refactor: ¿No debería ser un string?
	titulo = ''/*  {
	titulo: ""
  } */;
	#sesion;
	partes = [];
	columnaNotificaciones = [];
	// * Globales para el JS del frontend
	globales = {};
	/* ! Notificaciones:{
		post:Pregunta|Respuesta
			post.duenio: Usuario
			post.ID: integer
		// Dependiendo del tipo de post, y de quien es, el texto de la notificación. Ejemplos: "Nueva respuesta en tu pregunta {titulo}", "Nueva pregunta sobre {etiqueta suscrita". "Nueva respuesta en la pregunta {pregunta suscrita}". Preferentemente podrían tener una pequeña preview sobre el contenido del post.
		visto:boolean
	} */
	#encabezado;

	// TODO Refactor: Usar usuarioActual (o usuarioDeSesion) (sesion.usuario) en vez de sesion.
	constructor({ ruta = '/index', titulo, sesion, partes = [] }) {
		this.#ruta/* .ruta */ = ruta;
		this.titulo = titulo;
		this.#sesion = sesion;
		this.partes = Array.isArray(partes) ? partes : [partes];
		this.#encabezado = new Encabezado(this.#sesion);


		// TODO Feature: Poner los 3 modales acá.
		// Los de registro e inicio, podría chequear si sesion existe para agregarse o no
		// El de reportar (tanto post y usuario) dejarlos, total no molestan y después se llamarán desde los scripts estáticos

		if (sesion.usuario) {
			this.columnaNotificaciones = [
				// elemento = 'h1', clave, titulo, clases,id
				new Titulo('h2', 5, '<i class="fa-regular fa-bell mr-2"></i> Notificaciones', '', 'notificacion-titulo')
				, new DesplazamientoInfinito(
					'notificaciones-di'
					, '/api/notificacion'
					, n => (new Notificacion(n.ID, n, sesion.usuario.DNI)).render()
					, null // * Entidades iniciales.
					, {
						mensajeVacio: new MensajeInterfaz(MensajeInterfaz.INFORMACION, 'Todavía no tenés notificaciones.')
						, mensajeFinal: new MensajeInterfaz(MensajeInterfaz.INFORMACION, 'Esas son todas las notificaciones.')
					}
				)
			];
			this.globales.usuarioActual = sesion.usuario;
		}
	}

	// * Pagina.render solo se va a llamar desde el backend.
	render() {
		// * Quita los identificadores de las rutas, y los reemplaza por "viendo"
		let rutaRecursos = '/' + this.#ruta.split('/').map(parte => (/[0-9]/.test(parte)) ? 'viendo' : parte).join('-').substring(1);

		// TODO Feature: Meta properties. https://es.stackoverflow.com/questions/66388/poner-una-imagen-de-preview-y-t%C3%ADtulo-en-mi-p%C3%A1gina-para-que-se-visualice-en-face
		return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>FAQ UTN - ${this.titulo}</title>

		<script src="/scripts/visibilizar-clases.js" type="module" async></script>
		
		<script>${Object.entries(this.globales)
				.map(([k, v]) => `var ${k} = ${JSON.stringify(v)}`)
				.join(";")}</script>

		<script src="/main.js" type=module></script>
		<link rel="stylesheet" href="/main.css">
		<link rel="icon" href="../favicon-32x32.png">

		<script src="/scripts${rutaRecursos + ".js"}" type="module"></script>
		<link rel="stylesheet" href="/styles${rutaRecursos + ".css"}">
		
		<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
		<script src="/scripts/alertas.js"></script>
		<link rel="stylesheet" href="https://unpkg.com/@sweetalert2/theme-bulma@5.0.16/bulma.css"></link>

		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma-switch@2.0.4/dist/css/bulma-switch.min.css">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@creativebulma/bulma-tagsinput@1.0.3/dist/css/bulma-tagsinput.min.css">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.5.1/css/all.css">

	</head>
	<body>
		${this.#encabezado.render()}
		<div id="contenedor-principal" class="columns">
			<div  id="columna-1" class="column is-3">
				${new Navegacion(this.#sesion?.usuario, this.#ruta).render()}
			</div>
			<div id="columna-principal" class="column is-5">
				${new Breadcrumb(this.#ruta).render()}
				${new Titulo('h1', 5, this.titulo, 'ml-3rem', 'titulo-principal').render()}
				${this.partes ? this.partes.map((p) => p.render()).join("") : ''}
				
			</div>
			<div id="columna-3" class="column is-4">
				<!--<div id="notificacion-titulo">Notificaciones</div>-->
				${this.columnaNotificaciones.reduce((acc, parte) => acc + parte.render(), '')}
			</div>
		</div>
	
	  </div>
	
			
		<footer id="footer">
			<div><img src="/logo-negativo.png"></div>
			<div>
				<ul>
				<!--TODO UX Poner como una columna a la izquierda, porque se supone que tenga 3 items.-->
					<li><a href="/">Inicio</a></li>
					<li><a href="/quienes-somos">Quiénes Somos</a></li>
				</ul>
				${new Navegacion(this.#sesion?.usuario).render()}
			</div>
			<div id="footer-enlaces-externos">
			<a href="https://www.frro.utn.edu.ar/">Sitio Web UTN</a><a href="https://www.instagram.com/utnalumnosfrro/">Instagram Dirección Alumnos</a><a href="https://frro.cvg.utn.edu.ar/">Campus Virtual Global (CVG)</a>
			<br>Diseño del sitio / logo © 2024 F.A.Q. UTN</div>
		</footer>
		<!-- TODO Refactor: Meter esto en su propio archivo, por mantenibilidad. -->
		<script>
		document.addEventListener('DOMContentLoaded', () => {
			// Funciones para abrir y cerrar el modal
			function openModal($el) {
				$el.classList.add('is-active');
			}
		
			function closeModal($el) {
				$el.classList.remove('is-active');
			}
		
			function closeAllModals() {
				(document.querySelectorAll('.modal') || []).forEach(($modal) => {
				closeModal($modal);
				});
			}
		
			// Agrega un evento de clic en los botones para abrir un modal específico
			(document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
				const modal = $trigger.dataset.target;
				const $target = document.getElementById(modal);
		
				$trigger.addEventListener('click', () => {
				openModal($target);
				});
			});
		
			// Agrega un evento de clic en varios elementos secundarios para cerrar el modal principal
			(document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
				const $target = $close.closest('.modal');
		
				$close.addEventListener('click', () => {
				closeModal($target);
				});
			});
		
			// Agrega un evento de teclado para cerrar todos los modales
			document.addEventListener('keydown', (event) => {
				if(event.key === "Escape") {
				closeAllModals();
				}
			});
			});

			  // Coloca aquí el código del MutationObserver
			  function cerrarNotificacion($delete) {
				  const $notification = $delete.parentNode;
				  $notification.parentNode.removeChild($notification);
			  }
	  
			  function callback(mutationsList, observer) {
				  for(const mutation of mutationsList) {
					  if (mutation.type === 'childList') {
						  mutation.addedNodes.forEach(node => {
							  if (node.classList && node.classList.contains('notification')) {
								  const $delete = node.querySelector('.delete');
								  if ($delete) {
									  $delete.addEventListener('click', () => {
										  cerrarNotificacion($delete);
									  });
								  }
							  }
						  });
					  }
				  }
			  }
	  
			  const observer = new MutationObserver(callback);
			  observer.observe(document.body, { childList: true, subtree: true });
	  
			  document.addEventListener('DOMContentLoaded', () => {
				  document.querySelectorAll('.notification .delete').forEach($delete => {
					  $delete.addEventListener('click', () => {
						  cerrarNotificacion($delete);
					  });
				  });
			  });
			</script>
		</body>
</html>`;
	}
}

class Encabezado {
	#modalLogin;
	#modalRegistro;
	#modalResetearContrasenia
	#posibleUsuario;
	#posibleForm
	#sesion;
	constructor(sesion) {
		this.#sesion = sesion;
		if (sesion && sesion.usuario) {
			this.#posibleUsuario = new ChipUsuario(sesion.usuario);
			this.#posibleForm = new Formulario(
				'formularioCerrarSesion'
				, '/api/sesion'
				, []
				, this.procesarRespuesta
				, { textoEnviar: 'Cerrar Sesion', verbo: 'DELETE', clasesBoton: 'is-link is-light is-small' }
			);

		} else {
			this.#modalLogin = new Modal('Ingresar', 'modal-login');
			this.#modalRegistro = new Modal('Registrarse', 'modal-registro');
			this.#modalResetearContrasenia = new Modal('Olvidé mi contraseña', 'modal-resetear-contrasenia');
			let formLogin = new Formulario(
				'formularioSesion'
				, '/api/sesion'
				, [
					{ name: 'DNI', textoEtiqueta: 'D.N.I.', type: 'text' },
					{ name: 'contrasenia', textoEtiqueta: 'Contraseña', type: 'password' }
				]
				, this.procesarRespuesta
				, { textoEnviar: 'Ingresar', verbo: 'POST', clasesBoton: 'is-link is-rounded mt-3' }
			);
			let formRegistro = new Formulario(
				'formularioRegistro'
				, '/api/usuario'
				, [
					// TODO Feature: Sanitizar DNIs en el backend
					{ name: 'DNI', textoEtiqueta: 'D.N.I.<br><small>(sin puntos)</small>', type: 'text' },
					{ name: 'correo', textoEtiqueta: 'Correo electrónico <br><small>(opcional, ignorar para usar el registrado en la UTN, se puede cambiar luego)</small>', type: 'email', required: false },
					{ name: 'contrasenia', textoEtiqueta: 'Contraseña', type: 'password' }
				]
				, this.procesarRegistro
				, { textoEnviar: 'Ingresar', verbo: 'POST', clasesBoton: 'is-link is-rounded mt-3' }
			);
			let formResetearContrasenia = new Formulario(
				'formularioResetearContraseña'
				, '/api/usuario/contrasenia'
				, [
					{ name: 'DNI', textoEtiqueta: 'D.N.I.', type: 'text' },
					{ name: 'correo', textoEtiqueta: 'Correo electrónico', type: 'email', required: true },
				]
				, this.procesarResetearContrasenia
				, { textoEnviar: 'Resetear Contraseña', verbo: 'POST', clasesBoton: 'is-link is-rounded mt-3' }
			);
			this.#modalLogin.contenido.push(formLogin);
			this.#modalLogin.contenido.push(new Boton({ titulo: 'Olvidé mi Contraseña', classes: 'mt-3 is-rounded js-modal-trigger olvide-contrasenia', dataTarget: 'modal-resetear-contrasenia' }))
			this.#modalRegistro.contenido.push(formRegistro);
			this.#modalResetearContrasenia.contenido.push(formResetearContrasenia)
		}
	}

	procesarRespuesta(respuesta, { ok, codigo }) {
		if (ok) {
			location.reload();
		} else Swal.error(respuesta);
	}

	procesarRegistro(respuesta, { ok, codigo }) {
		if (ok) {
			location.reload();
			// TODO Refactor: replace, volver a entrar, con nueva info, con nuevas cookies
			// location.replace(ruta);
		} else Swal.error(`Error ${codigo}: ${respuesta}`);
	}

	procesarResetearContrasenia(respuesta, { ok, codigo }) {
		if (ok) {
			Swal.exito(respuesta);
		} else Swal.error(`Error ${codigo}: ${respuesta}`);
	}


	render() {
		return `<div id="encabezado">
	<div id=encabezado-izquierdo>
		<img src="/logo.png">
		<h1>FAQ UTN</h1>
		<a href="/">Inicio</a>
		<a href="/quienes-somos">Quiénes Somos</a>
	</div>
	<div id=encabezado-derecho>
		${
			// ACOMODAR EL TEMA DEL MODAL DE LOGIN
			this.#posibleUsuario ? (
				this.#posibleUsuario.render()
				//+ new Boton({titulo: 'Cerrar Sesión', classes: 'button is-link is-inverted is-small'}).render()
				+ this.#posibleForm.render()
			) : (
				new Boton({ titulo: 'Ingresar', classes: 'button is-link is-outlined js-modal-trigger', dataTarget: 'modal-login' }).render()
				+ new Boton({ titulo: 'Registrarse', classes: 'button is-link js-modal-trigger', dataTarget: 'modal-registro' }).render()
				// TODO Feature: Botón de olvidé la contraseña
				+ this.#modalLogin.render() + ' '
				+ this.#modalRegistro.render() + ' '
				+ this.#modalResetearContrasenia.render() + ' '
			)}
	</div>
</div>`;
	}

}

export { Pagina, Encabezado };