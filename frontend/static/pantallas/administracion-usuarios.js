import { Pagina, Titulo, Formulario, Tabla } from '../componentes/todos.js'

function crearPantalla(ruta,sesion){
	let tabla=new Tabla('administrar-usuarios','/api/usuario?reportados=1',[
		{
			nombre:'Usuario',
			celda:(usu)=>usu.nombre
		},{
			nombre:'Cant. Reportes',
			celda:(usu)=>usu.cantidadDeReportes
		},{
			nombre:'Último Reporte',
			celda:(usu)=>usu.fechaUltimoReporte
		}
		,{
			nombre:'Estado',
			celda:(usu)=>'<button></button>'
			// TODO Feature: Un toggle que represente si el usuario está bloqueado o no, y que permita el cambio. A priori, una checkbox glorificada
		}
	]/* ,usuariosReportados */);
	let pagina = new Pagina({
    ruta: ruta,
    titulo: 'Administración - Usuarios Reportados',
    sesion: sesion,
		partes:[
			/* new Titulo(3,'Usuarios Reportados')
			, */
			// TODO Feature: Considerar si vale la pena filtro por persona
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
			tabla
		]
  });
	return pagina;
}

export {crearPantalla as PantallaAdministracionUsuarios};