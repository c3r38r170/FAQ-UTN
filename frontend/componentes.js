import { Busqueda } from "./static/componentes/busqueda.js";
import { ChipUsuario } from "./static/componentes/chipusuario.js";
import { Etiqueta } from "./static/componentes/etiqueta.js";
import { Navegacion } from "./static/componentes/navegacion.js";
import { Notificacion } from "./static/componentes/notificacion.js";
import { Pregunta } from "./static/componentes/pregunta.js";
import { Breadcrumb } from "./static/componentes/breadcrumb.js";
import { Tabla } from "./static/componentes/tabla.js";

// TODO Feature: Tirar errores en los constructores con parámetros necesarios 

class Pagina {
	// TODO Refactor: ¿No debería ser un string?
  #ruta = {
	ruta: ""
  };
  #titulo;
  #sesion;
  partes = [];
	// * Globales para el JS del frontend
  globales = {};
	/* ! Notificaciones:{
		usuario:Usuario
		post:Pregunta|Respuesta
		// Dependiendo del tipo de post, y de quien es, el texto de la notificación. Ejemplos: "Nueva respuesta en tu pregunta {titulo}", "Nueva pregunta sobre {etiqueta suscrita". "Nueva respuesta en la pregunta {pregunta suscrita}". Preferentemente podrían tener una pequeña preview sobre el contenido del post.
		visto:boolean
	} */
  #notificaciones = [
    { notificacion: "mesas de examen" },
    {
      notificacion:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
    },
    { notificacion: "XXXXXXX ha valorado tu respuesta" },
    {
      notificacion:
        "asdfasdflasdkfhjakslLorem Ipsum is simply dummy text of the printing and typesetting industry",
    },
  ];

  constructor({ ruta, titulo, sesion ,partes=[]}) {
    this.#ruta.ruta = ruta;
    this.#titulo = titulo;
	this.#sesion = sesion;
	this.partes = Array.isArray(partes) ? partes : [partes];

  // TODO Feature: Poner los 3 modales acá.
	// Los de registro e inicio, podría chequear si sesion existe para agregarse o no
	// El de reportar (tanto post y usuario) dejarlos, total no molestan y después se llamarán desde los scripts estáticos

    // Navegacion(sesion,ruta)
     if(sesion){
			// Notificaciones(sesion)
			this.globales.usuarioActual=sesion;
		} 
  }
  render() {
		// TODO Feature: Meta properties. https://es.stackoverflow.com/questions/66388/poner-una-imagen-de-preview-y-t%C3%ADtulo-en-mi-p%C3%A1gina-para-que-se-visualice-en-face
    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>FAQ UTN - ${this.#titulo}</title>

		<script>${Object.entries(this.globales)
      .map(([k, v]) => `var ${k} = ${JSON.stringify(v)}`)
      .join(";")}</script>
		<!-- <script src="https://unpkg.com/@c3r38r170/c3tools@1.1.0" type="module"></script> -->

		<script src="/main.js" type=module></script>
		<link rel="stylesheet" href="/main.css">

		<script src="${this.#ruta + ".js"}"></script>
		<link rel="stylesheet" href="${this.#ruta + ".css"}">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
	</head>
	<body>
		${new Encabezado(this.#sesion).render()}
		<div id="contenedor-principal" class="columns">
			<div  id="columna-1" class="column is-3">
				${new Navegacion(this.#sesion).render()}
			</div>
			<div id="columna-principal" class="column is-5">
				${new Breadcrumb(this.#ruta).render()}
				${this.partes.map((p) => p.render()).join("")}
				
			</div>
			<div id="columna-3" class="column is-6">
				<div id="notificacion-titulo">Notificaciones</div>
				${this.#notificaciones.map((n) => new Notificacion(n).render()).join("")}
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
	</body>
</html>`;
  }
}

class Encabezado {
  #posibleUsuario;
  constructor(sesion) {
    if (sesion) {
      this.#posibleUsuario = new ChipUsuario(sesion);
    }
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
      this.#posibleUsuario ||
      "<button id=ingresar>Ingresar</button>" +
        "<button id=registrarse>Registrarse</button>"
    }
	</div>
</div>`;
  }
}

class DesplazamientoInfinito{
	// TODO Refactor: Unificar configuracion de paginacion; como cantidad por pagina
	// Esto será de algún componente
	// Específicamente: Preguntas, Notificaciones...
	static instancias={};

	#endpoint='';
	#pagina=1;
	#id='';
	#generadorDeComponentes=null;

	#entidadesIniciales=[];

 	constructor(id,endpoint,transformarRespuestaEnComponente,primerasEntidades=[]){
		// TODO Feature: fallar si no se proveen los parámetros obligatorios. Aplicar a todfas las clases.
		this.#id=id;
		this.#endpoint=endpoint;
		this.#generadorDeComponentes=transformarRespuestaEnComponente;
		this.#entidadesIniciales=primerasEntidades;

		DesplazamientoInfinito.instancias[id]=this;
	}

	navegar(e){
		let imagenAlcahuete=e.target;
		let contenedor=imagenAlcahuete.parentNode;
		// TODO Feature: Ver si tiene o no ?, y entonces poner ? o &. Quizá hacerlo en el constructor y tener algo como un this.#parametroPagina.  Mejor solución (aplicar a tabla): poner en el constructor de manera inteligente uno u otro, guardar la url con el parametro página, y simplemente hacer +(this.#pagina...);
		let url=this.#endpoint+`?pagina=${this.#pagina-1}`;
		this.#pagina++;

		fetch(url,{
			credentials:'include',
			method:'GET'
		})
			.then(res=>res.json())
		/* new Promise((resolve, reject)=>{
			resolve(new Array(3).fill(null).map((n,i)=>(3*(this.#pagina-1)+i)));
		}) */
			.then((nuevasEntidades)=>{
				let html='';

				for(let ent of nuevasEntidades){
					html+=this.#generadorDeComponentes(ent);
				}

				imagenAlcahuete.remove();
				html+=this.#generarUltimoComponente(nuevasEntidades.length);

				contenedor.innerHTML+=html;
			})
			// TODO Feature: catch; y finally?
	}

	#generarUltimoComponente(cantidadDeEntidadesEnIteracion=this.#entidadesIniciales.length){
		let html='';

		// TODO Refactor: Poner algún componente de paginación en el frontend, que en su defecto obtenga la info del backend. Ver que no destruya ninguna renderización... quizá llevar la configuración del frontend AL backend? Suena a lo más oportuno, por mas que sea antiintuitivo...
		if(cantidadDeEntidadesEnIteracion<10){
			// TODO UX: Mensaje de que no hay más entidades, de que se llegó al fin del desplazamiento. Componente mensaje PFU-130
		}else{
			// TODO UX: Un loading GIF que no de asco. Y que pegue con el resto.
			html+=`<img loading="lazy" src="/loading.gif" onload="DesplazamientoInfinito.instancias['${this.#id}'].navegar(event)">`;
		}

		return html;
	}

	render(){
		// TODO UX: CSS de esto
		return `<div id=${this.#id}>`+this.#entidadesIniciales.map(this.#generadorDeComponentes)+this.#generarUltimoComponente()+`</div>`;
	}
}

class ComponenteLiteral{
	// * Para casos de un solo uso, donde querramos inyectar algo de HTML o un componente nuevo muy específico. También da flexibilidad entre líneas de desarrollo, para no tener que esperar a que se cree algun componente para probar cosas.
	#funcion=null;
	constructor(funcion){
		this.#funcion=funcion;
	}
	render(){
		return this.#funcion();
	}
}

export { Pagina, Busqueda, DesplazamientoInfinito, ComponenteLiteral};


