import { Pagina, Titulo, Formulario, Tabla,Fecha, ChipUsuario, Modal } from '../componentes/todos.js'

function crearPantalla(ruta,sesion){
	let tabla=new Tabla('administrar-usuarios','/api/usuario?reportados=1',[
		{
			nombre:'Usuario',
			celda:(usu)=>new ChipUsuario(usu).render()
			// celda:(usu)=>usu.nombre
		},{
			nombre:'Cant. Reportes',
			clases:['centrado'],
			celda:(usu)=>usu.reportesRecibidos.length
		},{
			nombre:'Último Reporte',
			clases:['centrado'],
			celda:(usu)=>new Fecha(usu.reportesRecibidos[0].fecha,Fecha.CORTA).render() // * Debería al menos tener un reporte para estar aquí.
		}
		,{
			nombre:'Bloqueado',
			clases:['centrado'],
			celda:(usu)=>`<div class="field"><input type="checkbox" value="${usu.DNI}" id="bloqueo-${usu.DNI}" class="switch" ${usu.bloqueosRecibidos?.length?'checked':''}><label for="bloqueo-${usu.DNI}"></label></div>`
		}
	]/* ,usuariosReportados */);
	let pagina = new Pagina({
    ruta: ruta,
		// TODO Refactor: Cambiar en todos lados de Administración a Moderación
    titulo: 'Administración - Usuarios Reportados',
    sesion: sesion,
		partes:[
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
			new Modal('Bloquear usuario','administrar-usuarios-modal'), // * El título se va cambiando.
			tabla
		]
  });
	return pagina;
}

export {crearPantalla as PantallaAdministracionUsuarios};