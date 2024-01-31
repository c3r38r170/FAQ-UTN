import * as express from "express";
import {Sequelize} from 'sequelize';
const router = express.Router();
import { Pagina, DesplazamientoInfinito } from "../frontend/componentes.js";
import { Pregunta } from "../frontend/static/componentes/pregunta.js";
import { ChipUsuario } from "../frontend/static/componentes/chipusuario.js";
import { Busqueda  } from "../frontend/static/componentes/busqueda.js"
import { Respuesta } from "../frontend/static/componentes/respuesta.js";
import { Tabla } from "../frontend/static/componentes/tabla.js";
import { EtiquetasPregunta as EtiquetasPreguntaDAO, Etiqueta as EtiquetaDAO, Pregunta as PreguntaDAO, SuscripcionesPregunta, Usuario as UsuarioDAO, Respuesta as RespuestaDAO, Post as PostDAO, ReportesUsuario as ReportesUsuarioDAO} from '../api/v1/model.js';
import { MensajeInterfaz } from "../frontend/static/componentes/mensajeInterfaz.js";
import { Titulo } from "../frontend/static/componentes/titulo.js"
import { Desplegable } from "../frontend/static/componentes/desplegable.js";
import { Modal } from "../frontend/static/componentes/modal.js";
//import { Formulario } from "../frontend/static/componentes/formulario.js";

// TODO Feature: ¿Configuración del DAO para ser siempre plain o no?  No funcionaría con las llamadas crudas que hacemos acá. ¿Habrá alguna forma de hacer que Sequelize lo haga?
// PreguntaDAO.siemprePlain=true; // Y usarlo a discresión.

/*
router.get("/", (req, res) => {
	if(req.query.consulta || req.query.etiquetas){
		// TODO Refactor: Ver si req.url es lo que esperamos (la dirección completa con parámetros)
		let queryString = req.url.substring(req.url.indexOf('?'));
		// * Acá sí pedimos antes de mandar para que cargué más rápido y se sienta mejor.
		PreguntaDAO.pagina({
			consulta:req.query.consulta,
			etiquetas:req.query.etiquetas
		})
		PreguntaDAO.pagina()
		.then(pre=>{
				let pagina = new Pagina({
					ruta: req.path,
					titulo: "Inicio",
					sesion: req.session.usuario,
				});
				pagina.partes.push(
					new Busqueda('Hola')
					,new DesplazamientoInfinito('inicio-preguntas','/api/v1/preguntas'+queryString,p=>new Pregunta(p),pre)
					// TODO Feature: , control de paginación
					// TODO Feature: Desplazamiento infinito
				)
				res.send(pagina.render());
			})
	}else{ // * Inicio regular.
		 PreguntaDAO.pagina()
			.then(pre=>{ 
				let pagina = new Pagina({
					ruta: req.path,
					titulo: "Inicio",
					sesion: req.session.usuario,
				});
				pagina.partes.push(
					new Busqueda('Hola')
					,new DesplazamientoInfinito('inicio-preguntas','/api/v1/preguntas',p=>new Pregunta(p))
				)
				res.send(pagina.render());
			 })
			// TODO Feature: Catch (¿generic Catch? "res.status(500).send(e.message)" o algo así))
	}
});
*/



//Ruta que muestra todas las preguntas y respuestas
// Falta implementar la paginación
router.get("/", async (req, res) =>  {
    try {
        const preguntas = await PreguntaDAO.findAll({
            include: [
                {
                    model: PostDAO,
                    as: 'post',
					include: [
						{
							model: UsuarioDAO,
							as: 'duenio'
						}
					]
                },
                {
                    model: RespuestaDAO,
                    as: 'respuestas',
					include: [
						{
							model: PostDAO,
							as: 'post',
							include: [
								{
									model: UsuarioDAO,
									as: 'duenio'
								}
							]
						}
					],
					order: [['createdAt', 'DESC']]
                },
				{
					model: EtiquetaDAO
				}
            ]
        });

        if (!preguntas || preguntas.length === 0) {
            res.status(404).send('No se encontraron preguntas');
            return;
        }

        let pagina = new Pagina({
            ruta: req.path,
            titulo: 'Inicio',
            sesion: req.session.usuario
        });

		
		let modal = new Modal('General','modal-general');
		pagina.partes.push(modal);
		pagina.partes.push(new Busqueda())
		for(let i=0; i < preguntas.length;i++){
			pagina.partes.push(new Pregunta(preguntas[i].dataValues,modal));
		}

        res.send(pagina.render());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});


/*
router.get("/pregunta/:id?", (req, res) => {
	if(req.params.id){
		PreguntaDAO.findByPk(req.params.id,{plain: true}) // TODO Refactor: hace falta el plain?? ¿No es raw + nest? 
			.then((p)=>{
				if(!p){
					res.status(404).send('ID de pregunta inválida');
				}
	
				let pagina=new Pagina({
					ruta:req.path
					,titulo:p.titulo
					,sesion:req.session.usuario
					,partes:[
						// TODO Feature: Diferenciar de la implementación en / así allá aparece la primera respuesta y acá no.
						new Pregunta(p)
						,...p.respuestas.map(r=>new Respuesta(r))
						// TODO Feature: si está logueado, campo de hacer una respuesta
					]
				});
				res.send(pagina.render());
			})
	}else{ // * Nueva pregunta.
		let pagina=new Pagina({
			ruta:req.path
			,titulo:p.titulo
			,sesion:req.session.usuario
			,partes:[
				// TODO Feature: Formulario de creación de preguntas 
				// Campo de Título. Tiene que sugerir preguntar relacionadas. 
				// Campo de etiquetas. Se deben obtener las etiquetas, mostrarlas, permitir elegirlas.
				// Campo de cuerpo. Texto largo con un máximo y ya.
				// Las sugerencias pueden ser un panel abajo, o abajo del título... que se vaya actualizando a medida que se escribe el cuerpo.
				// Botón de crear pregunta. Se bloquea, si hay un error salta cartel (como por moderación), si no lleva a la página de la pregunta. Reemplaza, así volver para atrás va al inicio y no a la creación de preguntas.
			]
		});
		res.send(pagina.render());
	}
});

*/

router.get("/suscripciones",(req,res)=>{
	
	if(!req.session.usuario){
		res.status(401).send();
		return;
	}
	
	PreguntaDAO.findAll({
		// TODO Feature: limitar, pagina 0, hacer función de filtroPorSuscripciones (getBySuscripciones??)
		// TODO Refactor: Actualizar cuando se cambie la forma de asociación entre Pregunta y Respuesta 
		include:{
			model:SuscripcionesPregunta
			,where:{
				suscriptoAPregunta:req.session.usuario.DNI
			}
		}
	})
		.then((preguntas)=>{
			let pagina=new Pagina({
				ruta:req.path
				,titulo:p.titulo
				,sesion:req.session.usuario
				// TODO Feature: endpoint de preguntas por suscripción
				,partes:new DesplazamientoInfinito(
					'suscripciones-desplinf',
					'/preguntas?suscritas',
					// TODO Feature: Indicar que acá es con la primera respuesta. Quizá buscar con el DAO con o sin Respuestas y que el componente vea si hay o no para poner la más relevante a la vista; es buena esa.
					p=>new Pregunta(p),
					preguntas
				)
			});
			
			res.send(pagina.render());
		})
})

router.get("/perfil/:id?", (req, res) => {
	// TODO Feature: Ordenar posts por fecha
	/* TODO Feature: si no hay ID, es el propio; si hay ID, solo lectura y posts */
	// TODO Refactor: DNI
	let id=req.params.id /* || req.session.usuario.DNI*/ ;
	let logueadoId /*=req.session.usuario.DNI;*/
	// let titulo="Perfil de ";
	let usu;

	if(id && (!logueadoId || id != logueadoId)){
		// TODO Refactor: ver si yield anda como "sincronizador"
		usu=UsuarioDAO.findByPk(id/* ,{
			include:{
				// TODO Feature: Ver si no choca explota. Y si .posts choca con los eliminados
				all:true
				,nested:true
			}
		} */);

	}else{
		// TODO Feature: Obtener los posts paginados por ID del usuario, la sesion no guarda las asociaciones
		usu=req.session.usuario;
	}
		// TODO Feature: Componente "Tarjeta de Usuario", o hacer una versión del Chip de Usuario con esteroides? Ya no sería chip... Pero llevan básicamente la misma info. Y además daría la opción de reportar o banear dependiedno si el usuario está logueado y tiene permisos
		/* tarjeta de usuario 
		actividad*/
  let pagina = new Pagina({
    ruta: req.path,
    titulo: 'Perfil de '+usu.nombre,
    sesion: req.session.usuario,
		partes:[
			new DesplazamientoInfinito(
				'perfil-desplinf'
				,`/api/v1/usuario/${usu.DNI}/posts`
				,p=>{
					return p.pregunta?
						new Pregunta(p.pregunta)
						:new Respuesta(p.respuesta)
				}
				// ,usu.posts
			)
		]
  });
  res.send(pagina.render());
});

router.get("/perfil/info", (req, res) => {
	/* TODO Feature: Hacer que /perfil lleve a /perfil/id/info ??  Pensarlo. */
	// ! El usuario no puede cambiar rol, legajo, ni nombre (este no estoy tan seguro), pero sí imagen (CU 5.4) y contraseña
	// * No permitir entrar al de alguien más, si ya toda la info está en /perfil/:id
/* 
	let id=req.params.id;
	let logueadoId=req.session.usuario.ID;
	let titulo="Perfil de ";
	let usu;
	let imagenEditable=false;

	if(id && (!logueadoId || id != logueadoId)){
		usu= UsuarioDAO.findById(id,{
			include:{
				// TODO Feature: Ver si no choca explota. Y si .posts choca con los eliminados
				all:true
				,nested:true
			}
		});
	}else{
		imagenEditable=true;
		usu=req.session.usuario;
	}
 */
	let usu=req.session.usuario;

  let pagina = new Pagina({
    ruta: req.path,
    titulo: 'Perfil de '+usu.nombreCompleto+' - Información',
    sesion: usu /* req.session.usuario */,
		partes:[
			// Título('Información básica' (,nivel?(h2,h3...)) )
			// CampoImagen(usu.id) // Editable
			// Campo('Nombre completo',usu.nombre)
			// Campo('Legajo',usu.legajo)
			// Campo('Rol',usu.rol.nombre)
			// Campo('Contraseña'); // Editable
		]
  });
  res.send(pagina.render());
});

// Ruta que muestra 1 pregunta con sus respuestas
router.get("/pregunta/:id?", async (req, res) =>  {
    try {
        const p = await PreguntaDAO.findByPk(req.params.id, {
            //raw: true,
            //plain: true,
            //nest: true,
            include: [
                {
                    model: PostDAO,
                    as: 'post',
					include: [
						{
							model: UsuarioDAO,
							as: 'duenio'
						}
					]
                },
                {
                    model: RespuestaDAO,
                    as: 'respuestas',
					include: [
						{
							model: PostDAO,
							as: 'post',
							include: [
								{
									model: UsuarioDAO,
									as: 'duenio'
								}
							]
						}
					],
					order: [['updatedAt', 'DESC']]
                },
				{
					model: EtiquetaDAO
				}
            ]
        });

        if (!p) {
            res.status(404).send('ID de pregunta inválida');
            return;
        }

        let pagina = new Pagina({
            ruta: req.path,
            titulo: 'Post',
            sesion: req.session.usuario
        });

        pagina.partes.push(
            // TODO Feature: Diferenciar de la implementación en / así allá aparece la primera respuesta y acá no.
            new Pregunta(p)
			
            //,...p.respuestas.map(r=>new Respuesta(r))
        );

        res.send(pagina.render());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});
// TODO UX: ¿Qué habría en /administración? ¿Algunas stats con links? (reportes nuevos, usuarios nuevos, qsy)  Estaría bueno.

router.get('/administracion/usuarios',(req,res)=>{
	let usu=req.session.usuario;
	// TODO Security: Permisos. Acá y en todos lados.

	// TODO Refactor: Página. Un método que se encargue de la paginación, los límites, los filtros, la agrupación, los datos extra (cantidadDeReportes)
	let usuariosReportados=ReportesUsuarioDAO.findAll({
		include:[
			{
				model:UsuarioDAO
				,attributes:[]
				,include:BloqueoDAO
			}
		]
		,attributes:[
			'Usuario.ID'
			,'Usuario.nombre'
			,'Usuario.DNI'
		]
		,group:[
			'ID'
			,'nombre'
			,'DNI'
			,[Sequelize.literal('MAX(fecha)'),'fechaUltimoReporte']
			,[Sequelize.literal(`COUNT(*)`), `cantidadDeReportes`]
		]
		/* ,where:{
			[Sequelize.or]:[
				{'$Usuario.Bloqueo':{[Sequelize.Op.is]:null}}
				,{'$Usuario.Bloqueo.fecha_desbloqueo$':{[Sequelize.Op.not]:null}}
			]
		} */
		,order:['fecha','DESC']
		,limit:15
	});

  let pagina = new Pagina({
    ruta: req.path,
    titulo: 'Administración - Usuarios Reportados',
    sesion: usu /* req.session.usuario */,
		partes:[
			// Título('Usuarios Reportados' (,nivel?(h2,h3...)) )
			// Filtro de usuarios, busca por DNI. legajo y nombre.
			// TODO Feature: páginado
			// id,endpoint,columnas,entidades=[],cantidadDePaginas=1
			/*,new Tabla('administrar-usuarios','/reportes-de-usuarios',[
				{
					nombre:'Usuario'
					celda:(usu)=>usu.nombre;
				},{
					nombre:'Cant. Reportes'
					celda:(usu)=>usu.cantidadDeReportes;
				},{
					nombre:'Último Reporte'
					celda:(usu)=>usu.fechaUltimoReporte;
				}
				,{
					nombre:'Estado'
					// TODO Feature: Un toggle que represente si el usuario está bloqueado o no, y que permita el cambio. A priori, una checkbox glorificada
				}
			],usuariosReportados)*/
		]
  });
  res.send(pagina.render());
})

router.get('/perfil/preguntas',(req, res) => {
	let usu=req.session.usuario;
	// TODO Feature: Transformar esto en el endpoint correspondiente
	/* let preguntas=yield PreguntaDAO.findAll({
		include:[{
			model:PostDAO,include:{model:UsuarioDAO,as:'duenioPostID'}
	}]
		,where:{'duenioPostID':usu.ID}
	}); */

  let pagina = new Pagina({
    ruta: req.path,
    titulo: 'Perfil de '+usu.nombreCompleto+' - Preguntas',
    sesion: usu /* req.session.usuario */,
		partes:[
			// Título('Tus preguntas' (,nivel?(h2,h3...)) )
			// ChipUsuario() // Solo imagen y nombre; (O) Jhon Dow
			
			new DesplazamientoInfinito(
				'perfil-desplinf'
				,`/api/v1/usuario/${usu.DNI}/preguntas`
				,p=>new Pregunta(p.pregunta) // Sin chip de usuario, con botones de editar y borrar, con cantidad de respuestas...
			)
		]
  });
  res.send(pagina.render());
})

// TODO Refactor: Ver si se puede unificar el algoritmo de prefil/preguntas y perfil/respuestas
router.get('/perfil/respuestas',(req, res) => {
	let usu=req.session.usuario;

	// TODO Feature: Transformar esto en el endpoint correspondiente
	// TODO Feature: vER SI anda esto. Tanto acá como en Preguntas
	/* let respuestas=yield RespuestaDAO.findAll({
		include:[PostDAO,{model:UsuarioDAO,as:'duenioPostID'}]
		,where:{'duenioPostID':usu.ID}
	});
 */

  let pagina = new Pagina({
    ruta: req.path,
    titulo: 'Perfil de '+usu.nombreCompleto+' - Respuestas',
    sesion: usu /* req.session.usuario */,
		partes:[
			// Título('Tus Respuestas' (,nivel?(h2,h3...)) )
			// ChipUsuario() // Solo imagen y nombre; (O) Jhon Dow
			new DesplazamientoInfinito(
				'perfil-desplinf'
				,`/api/v1/usuario/${usu.DNI}/respuestas`
				,p=>new Respuesta(p.respuesta) // Sin chip de usuario, con botones de editar y borrar, con cantidad de respuestas...
			)
			// TODO UX: Ver la pregunta (titulo nomás). Que la respuesta sea un link a la pregunta.
		]
  });
  res.send(pagina.render());
})


router.get("/usuario/:id?", async (req, res) =>  {
	UsuarioDAO.findByPk(req.params.id,
		{raw:true,
        plain:true,
        nest:true
    	})
		.then((u)=>{
			if(!u){
				res.status(404).send('ID de usuario inválido');
			}

			let usuario = new Usuario(u)
			let chipusuario = new ChipUsuario(usuario.dataValues);

			res.send(console.log(usuario.dataValues));
		}) 

});


// Ruta Para búsqueda
// Solo muestra el formulario de búsqueda
// ToDo Feature 
// Se puede implementar que se muestren preguntas recientes... etc
router.get("/explorar", (req, res) => {
	let pagina = new Pagina({
	  ruta: req.path,
	  titulo: "Explorar",
	  sesion: req.session.usuario,
	});
	pagina.partes.push(new Busqueda())
	res.send(pagina.render());
  });
  

// RUTA DE PRUEBA PARA PROBAR
   router.get("/prueba/mensaje", async (req, res) =>  {
    try {
        
		let pagina = new Pagina({
            ruta: req.path,
            titulo: 'Prueba de Formulario',
            sesion: req.session.usuario
        });

		

		pagina.partes.push(new MensajeInterfaz(1,'No hay resultados'));
		pagina.partes.push(new MensajeInterfaz(2,'No hay resultados'));

		pagina.partes.push(new Titulo(5,'Desplegable'));
		let desplegable = new Desplegable('myDesplegable','Desplegable');
		let opciones = [{
			descripcion: 'Opcion 1',
			tipo: 'link',
			href: '#'
		},
		{
			descripcion: 'Opcion 2',
			tipo: 'link',
			href: '#'
		}]
		desplegable.opciones = opciones;
		pagina.partes.push(desplegable);
		

        res.send(pagina.render());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor de prueba/mensaje');
    }
});




  




export { router };