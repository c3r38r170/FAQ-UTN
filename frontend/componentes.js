import {ChipUsuario} from './static/componentes/chip-usuario.js';

class Pagina{
	#ruta;
	#titulo;
	partes=[];
	globales={};

	constructor({
		ruta
		,titulo
		,sesion
	}){
		this.#ruta=ruta;
		this.#titulo=titulo;
		this.partes.push(new Encabezado(sesion));
		// Navegacion(sesion,ruta)
		/* if(sesion){
			// Notificaciones(sesion)
			this.globales.usuarioActual=sesion;
		} */
	}
	render(){
		return`<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>FAQ UTN - ${this.#titulo}</title>

		<script>${Object.entries(this.globales).map(([k,v])=>`var ${k} = ${JSON.stringify(v)}`).join(';')}</script>
		<!-- <script src="https://unpkg.com/@c3r38r170/c3tools@1.1.0" type="module"></script> -->

		<script src="/main.js" type=module></script>
		<link rel="stylesheet" href="/main.css">

		<script src="${this.#ruta+'.js'}"></script>
		<link rel="stylesheet" href="${this.#ruta+'.css'}">
	</head>
	<body>
		${this.partes.map(p=>p.render()).join('')}
	</body>
</html>`;
	}
}

class Encabezado{
	#posibleUsuario;
	constructor(sesion){
		if(sesion){
			this.#posibleUsuario=new ChipUsuario(sesion);
		}
	}
	render(){
		return`<div id="encabezado">
	<div id=encabezado-izquierdo>
		<img src="/logo.jpg">
		<h1>FAQ UTN</h1>
		<a href="/">Inicio</a>
		<a href="/quienes-somos/">Quiénes Somos</a>
	</div>
	<div id=encabezado-derecho>
		${this.#posibleUsuario
			||'<button id=ingresar>Ingresar</button>'
				+'<button id=registrarse>Registrarse</button>'
		}
	</div>
</div>`;
	}
}

class Busqueda{
	render(){
		return '<input>'
	}
}

export {Pagina,Busqueda};