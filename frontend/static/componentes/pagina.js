// TODO Refactor: Chupar todo de todos.js
import { Modal } from "./modal.js";
import { Boton } from "./boton.js";
import { Breadcrumb } from "./breadcrumb.js";
import { Navegacion } from "./navegacion.js";
import { Notificacion } from "./notificacion.js";
import { Formulario } from './formulario.js';
import { ChipUsuario,DesplazamientoInfinito,Titulo } from './todos.js'

// TODO Feature: Tirar errores en los constructores con parámetros necesarios 
// TODO Refactor: Cambiar a Pantalla. Colisiona con el concepto de página de los modelos.
class Pagina {
	// TODO Refactor: ¿No debería ser un string?
  #ruta=''/*  = {
	ruta: ""
  } */;
  #titulo = {
	titulo: ""
  };
  #sesion;
  partes = [];
	columnaNotificaciones=[];
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
  constructor({ ruta='index', titulo, sesion,partes=[]}) {
    this.#ruta/* .ruta */ = ruta;
    this.#titulo = titulo;
	this.#sesion = sesion;
	this.partes = Array.isArray(partes) ? partes : [partes];
	this.#encabezado = new Encabezado(this.#sesion);
	

  // TODO Feature: Poner los 3 modales acá.
	// Los de registro e inicio, podría chequear si sesion existe para agregarse o no
	// El de reportar (tanto post y usuario) dejarlos, total no molestan y después se llamarán desde los scripts estáticos

    // Navegacion(sesion,ruta)
     if(sesion.usuario){
			this.columnaNotificaciones=[
				// TODO UX: Iconito de notificaciones. Ver los bocetos de las pantallas.
				new Titulo(5,'<i class="fa-regular fa-bell mr-2"></i> Notificaciones')
				,new DesplazamientoInfinito('notificaciones-di','/api/notificacion',n=>(new Notificacion(n)).render())
			];
			this.globales.usuarioActual=sesion.usuario;
		} 
  }

	// * Pagina.render solo se va a llamar desde el backend.
  render() {
		// TODO Feature: Meta properties. https://es.stackoverflow.com/questions/66388/poner-una-imagen-de-preview-y-t%C3%ADtulo-en-mi-p%C3%A1gina-para-que-se-visualice-en-face
    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>FAQ UTN - ${this.#titulo}</title>

		<script src="scripts/visibilizar-clases.js" type="module" async></script>
		
		<script>${Object.entries(this.globales)
      .map(([k, v]) => `var ${k} = ${JSON.stringify(v)}`)
      .join(";")}</script>
		<!-- <script src="https://unpkg.com/@c3r38r170/c3tools@1.1.0" type="module"></script> -->

		<script src="/main.js" type=module></script>
		<link rel="stylesheet" href="/main.css">

		<script src="scripts/${this.#ruta + ".js" }" type="module"></script>
		<link rel="stylesheet" href="styles/${this.#ruta + ".css"}">
		
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.5.1/css/all.css">
	</head>
	<body>
		${this.#encabezado.render()}
		<div id="contenedor-principal" class="columns">
			<div  id="columna-1" class="column is-3">
				${new Navegacion(this.#sesion).render()}
			</div>
			<div id="columna-principal" class="column is-5">
				${new Breadcrumb(this.#ruta).render()}
				<!-- TODO UX: Hacer Titulo -->
				<div id="titulo-principal" class="title is-5">${this.#titulo}</div>
				${this.partes.map((p) => p.render()).join("")}
				
			</div>
			<div id="columna-3" class="column is-4">
				<!--<div id="notificacion-titulo">Notificaciones</div>-->
				${this.columnaNotificaciones.reduce((acc,parte)=>acc+parte.render(),'')}
			</div>
		</div>
	
	  </div>
	
			
		<footer id="footer">
			<div>
				<img src="/logo.jpg">
			</div>
			<div>
				${new Navegacion().render()}
			</div>
			<div>
			Este es 3
			</div>
			<div>
			Site design - F.A.Q. UTN 2024
			</div>
		</footer>
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

			// Cierra los cartelitos notificaciones
			document.addEventListener('DOMContentLoaded', () => {
				(document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
				  const $notification = $delete.parentNode;
			  
				  $delete.addEventListener('click', () => {
					$notification.parentNode.removeChild($notification);
				  });
				});
			  });
			  
			
			</script>
		</body>
</html>`;
  }
}

class Encabezado {
	#modal;
  #posibleUsuario;
  #posibleForm
  constructor(sesion) {
    if (sesion && sesion.usuario) {
      	this.#posibleUsuario = new ChipUsuario(sesion.usuario);
		this.#posibleForm = new Formulario('formularioCerrarSesion', 'http://localhost:8080/api/sesion', [],
		this.procesarRespuesta.bind(this),  {textoEnviar:'Cerrar Sesion',verbo: 'DELETE'},'is-link is-light is-small');

    }else{ 
		this.#modal = new Modal('Ingresar','modal-login');
		let form = new Formulario('formularioSesion', 'http://localhost:8080/api/sesion', [
		['DNI', 'D.N.I.', { type: 'text' }],
		['contrasenia', 'Contraseña', { type: 'password' }],
		], this.procesarRespuesta.bind(this),  {textoEnviar:'Ingresar',verbo: 'POST'},'is-primary mt-3');
		this.#modal.contenido.push(form);
	}

  }

  procesarRespuesta(respuesta) {
	console.log('Respuesta:', JSON.stringify(respuesta));
	location.reload();
  }
  

  
  render() {
    return `<div id="encabezado">
	<div id=encabezado-izquierdo>
		<img src="/logo.jpg">
		<h1>FAQ UTN</h1>
		<a href="/">Inicio</a>
		<a href="/quienes-somos/">Quiénes Somos</a>
	</div>
	<div id=encabezado-derecho>
		${
			// ACOMODAR EL TEMA DEL MODAL DE LOGIN
      	this.#posibleUsuario ? (
			this.#posibleUsuario.render()
			//+ new Boton({titulo: 'Cerrar Sesión', classes: 'button is-link is-inverted is-small'}).render()
		    + this.#posibleForm.render()
			): (
       	new Boton({titulo:'Ingresar', classes: 'button is-info is-outlined js-modal-trigger', dataTarget:'modal-login'}).render()
		+ this.#modal.render() 
		+ new Boton({titulo:'Registrarse', classes: 'button is-info'}).render() 
		)}
	</div>
</div>`;
  }

}

export {Pagina,Encabezado};