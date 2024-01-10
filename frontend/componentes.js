import { Busqueda } from "./static/componentes/busqueda.js";
import { ChipUsuario } from "./static/componentes/chipusuario.js";
import { Etiqueta } from "./static/componentes/etiqueta.js";
import { Navegacion } from "./static/componentes/navegacion.js";
import { Notificacion } from "./static/componentes/notificacion.js";
import { Pregunta } from "./static/componentes/pregunta.js";
import { Breadcrumb } from "./static/componentes/breadcrumb.js";

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
	this.partes = partes;

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

export { Pagina, Busqueda };
