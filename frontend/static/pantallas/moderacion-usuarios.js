import { Pagina, Titulo, Formulario, Tabla, Fecha, ChipUsuario, Modal, Busqueda } from '../componentes/todos.js'

function crearPantalla(ruta, sesion, query = "") {
	let tabla = new Tabla('moderacion-usuarios', '/api/usuario?reportados=1&searchInput=' + query, [
		{
			nombre: 'Usuario',
			celda: (usu) => new ChipUsuario(usu).render()
			// celda:(usu)=>usu.nombre
		}, {
			nombre: 'Cant. Reportes',
			clases: ['centrado'],
			celda: (usu) => usu.reportesRecibidos.length
		}, {
			nombre: 'Último Reporte',
			clases: ['centrado'],
			celda: (usu) => new Fecha(usu.reportesRecibidos[0].fecha, Fecha.CORTA).render() // * Debería al menos tener un reporte para estar aquí.
		}
		, {
			nombre: 'Bloqueado',
			clases: ['centrado'],
			// TODO Refactor: Usar Boton
			celda: (usu) => `<div class="field"><input type="checkbox" value="${usu.DNI}" id="bloqueo-${usu.DNI}" class="switch" ${usu.bloqueosRecibidos?.length ? 'checked' : ''}><label for="bloqueo-${usu.DNI}"></label></div>`
		}
	]/* ,usuariosReportados */);
	let pagina = new Pagina({
		ruta: ruta,
		titulo: 'Moderación - Usuarios Reportados',
		sesion: sesion,
		partes: [
			/* new Titulo(3,'Usuarios Reportados')
			, */
			// TODO Feature: Considerar si vale la pena filtro por persona  Caso: Viene alguien y me dice que le hackearon la cuenta, la recuperó, y quiere que lo desbloqueen, ¿cómo lo buscan? ¿Si fue hace mil? ¿Si se hicieron banda de reportes?
			// Filtro de usuarios, busca por DNI. legajo y nombre.
			/* new Formulario(
				'moderacion-usuarios-buscar'
				,'/usuarios?reportados=1'
				,[
					{name:'filtro',textoEtiqueta:'Filtro (DNI, legajo o nombre)'}
				]
				,usuario=>{
					// tabla.
				}
				,{
					textoEnviar:'Buscar', clasesBoton:'is-link is-rounded mt-3'
				}
			) */
			// id,endpoint,columnas,entidades=[],cantidadDePaginas=1
			// ,
			new Modal('Bloquear usuario', 'moderacion-usuarios-modal'), // * El título se va cambiando.
			new Busqueda(),
			tabla
		]
	});
	return pagina;
}

export { crearPantalla as PantallaModeracionUsuarios };