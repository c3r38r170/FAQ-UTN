import * as express from "express";
import {Sequelize} from 'sequelize';
const router = express.Router();
/* 
*/
import { Pagina, DesplazamientoInfinito,Modal,  Pregunta , ChipUsuario , Busqueda , Respuesta , Tabla, MensajeInterfaz, Titulo, Formulario } from "./static/componentes/todos.js";
import { Voto as VotoDAO, Notificacion as NotificacionDAO, EtiquetasPregunta as EtiquetasPreguntaDAO, Etiqueta as EtiquetaDAO, Pregunta as PreguntaDAO, SuscripcionesPregunta as SuscripcionesPreguntaDAO, Usuario as UsuarioDAO, Respuesta as RespuestaDAO, Post as PostDAO, ReportesUsuario as ReportesUsuarioDAO, Bloqueo as BloqueoDAO, Usuario, Perfil as PerfilDAO, Permiso as PermisoDAO} from '../api/v1/model.js';


// TODO Feature: ¿Configuración del DAO para ser siempre plain o no?  No funcionaría con las llamadas crudas que hacemos acá. ¿Habrá alguna forma de hacer que Sequelize lo haga?
// PreguntaDAO.siemprePlain=true; // Y usarlo a discresión.

// TODO Refactor: Usar todas.js
import { PaginaInicio, PantallaNuevaPregunta, PaginaPregunta, PantallaAdministracionUsuarios } from './static/pantallas/todas.js';
import { PaginaPerfil } from "./static/pantallas/perfil.js";
import { PaginaPerfilPropioInfo } from "./static/pantallas/perfil-propio-info.js";
import { PaginaPerfilPropioPreguntas } from "./static/pantallas/perfil-propio-preguntas.js";
import { PaginaPerfilPropioRespuestas } from "./static/pantallas/perfil-propio-respuestas.js";

router.get("/", (req, res) => {
	// ! req.path es ''
	// TODO Feature: query vs body
	if(req.query.searchInput){
		// TODO Refactor: Ver si req.url es lo que esperamos (la dirección completa con parámetros)
		let queryString = req.url.substring(req.url.indexOf('?'));
		let filtro=[];
		filtro.texto=req.query.searchInput;
		let filtros={filtrar:filtro};
		
		// * Acá sí pedimos antes de mandar para que cargué más rápido y se sienta mejor.
		PreguntaDAO.pagina(filtros)

			.then(pre=>{
					let pagina=PaginaInicio(req.session, queryString);
					pagina.partes[2]/* ! DesplazamientoInfinito */.entidadesIniciales=pre;

					res.send(pagina.render());
				});
	}else{ // * Inicio regular.
		 PreguntaDAO.pagina()
			.then(pre=>{
				let pagina=PaginaInicio(req.session);
				pagina.partes[2]/* ! DesplazamientoInfinito */.entidadesIniciales=pre;

				res.send(pagina.render());
			 })
			// TODO Feature: Catch (¿generic Catch? "res.status(500).send(e.message)" o algo así))
	}
});


// Ruta que muestra 1 pregunta con sus respuestas
router.get("/pregunta/:id?", async (req, res) =>  {
    try {
			if (req.params.id) {
				const include = [
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
									},
									{
										model: VotoDAO,
										as: 'votos'
									}
								]
							}
						], 
						order: [['updatedAt', 'DESC']]
					},
					{
						model: EtiquetasPreguntaDAO,
						as: 'etiquetas',
						include: EtiquetaDAO
					}
				];
				// // Agregar la condición de suscripciones solo si req.session.usuario.DNI está definido
				// if (req.session.usuario && req.session.usuario.DNI) {
				// 	include.push({
				// 		model: SuscripcionesPreguntaDAO,
				// 		where: {
				// 			suscriptoDNI: req.session.usuario.DNI
				// 		},
				// 		as: 'suscriptos'
				// 	});
				// }
		
				const p = await PreguntaDAO.findByPk(req.params.id, { include});

				if (!p) {
					res.status(404).send('ID de pregunta inválida');
					return;
				}

				if(req.session.usuario){
					NotificacionDAO.findAll({
						include:[
							{
								model:PostDAO
								,include:{
									model:RespuestaDAO
									,as:'respuesta'
								}
							}
						],
						where:{
							notificadoDNI: req.session.usuario.DNI
							,visto:false
							,[Sequelize.Op.or]:{
								postNotificadoID:req.params.id
								,'$post.respuesta.preguntaID$':req.params.id
							}
						}
					})
						.then(notificaciones=>{
							for(let not of notificaciones){
								not.visto=true;
								not.save();
							}
						})
				}

				// ! No se puede traer votos Y un resumen, por eso lo calculamos acá. Los votos los traemos solo para ver si el usuario actual votó.

				//Ordenar respuestas por valoracion
				function calculateSumValoracion(respuesta) {
					return respuesta.post.votos.reduce((total, voto) => total + voto.valoracion, 0);
				}

				p.respuestas.map(respuesta=>{respuesta.dataValues.sumValoracion = calculateSumValoracion(respuesta)});
				p.dataValues.respuestas.sort((a, b)=>{
					return b.dataValues.sumValoracion -a.dataValues.sumValoracion
				});
				
				let preguntaID=p.ID;
				let pagina = PaginaPregunta(req.path, req.session, preguntaID)
				pagina.titulo=p.titulo;
				p.titulo="";
				pagina.partes.unshift(new Pregunta(p, pagina.partes[0], req.session))

				pagina.globales.preguntaID=preguntaID;

				res.send(pagina.render());
			}
			else{ // * Nueva pregunta.
				let pagina=PantallaNuevaPregunta(req.path,req.session);
				res.send(pagina.render());
			}
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});
// TODO UX: ¿Qué habría en /administración? ¿Algunas stats con links? (reportes nuevos, usuarios nuevos, qsy)  Estaría bueno.


router.get("/suscripciones",(req,res)=>{
	
	if(!req.session.usuario){
		res.status(401).send();
		return;
	}
	let modal = new Modal('General','modal-general');
	PreguntaDAO.findAll({
		// TODO Feature: limitar, pagina 0, hacer función de filtroPorSuscripciones (getBySuscripciones??)
		// TODO Refactor: Actualizar cuando se cambie la forma de asociación entre Pregunta y Respuesta 
		include:[
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
				model: EtiquetasPreguntaDAO,
				as:'etiquetas',
				include:EtiquetaDAO
			},
			{
			model:SuscripcionesPreguntaDAO
			,where:{
				suscriptoDNI:req.session.usuario.DNI
			}
			,as: 'suscriptos'
			}]
	})
		.then((preguntas)=>{
			let pagina=new Pagina({
				ruta:req.path
				,titulo: 'Suscripciones'
				,sesion:req.session
				// TODO Feature: endpoint de preguntas por suscripción
				,partes:[
					modal,
					new DesplazamientoInfinito(
					'suscripciones-desplinf',
					'/preguntas?suscritas',
					// TODO Feature: Indicar que acá es con la primera respuesta. Quizá buscar con el DAO con o sin Respuestas y que el componente vea si hay o no para poner la más relevante a la vista; es buena esa.
					p=>new Pregunta(p,modal,req.session).render(),
					preguntas
					)
					]
			});
			
			res.send(pagina.render());
		})
})


router.get("/etiqueta/:id/preguntas",async (req,res)=>{
	try {
		const e = await EtiquetaDAO.findByPk(req.params.id);
		
		if (!e) {
			res.status(404).send('ID de etiqueta inválida');
			return;
		}
		
		let modal = new Modal('General','modal-general');
		PreguntaDAO.findAll({
			// TODO Feature: limitar, pagina 0, hacer función de filtroPorSuscripciones (getBySuscripciones??)
			// TODO Refactor: Actualizar cuando se cambie la forma de asociación entre Pregunta y Respuesta 
			include:[
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
					model: EtiquetasPreguntaDAO
					,as:'etiquetas'
					,where:{
						etiquetumID:req.params.id
					},
					include:EtiquetaDAO
				}]
		})
		.then((preguntas)=>{
			let pagina=new Pagina({
				ruta:req.path
				,titulo: 'Etiqueta #'+e.descripcion
				,sesion:req.session
				// TODO Feature: endpoint de preguntas por suscripción
				,partes:[
					modal,
					new DesplazamientoInfinito(
					'suscripciones-desplinf',
					'/preguntas?suscritas',
					// TODO Feature: Indicar que acá es con la primera respuesta. Quizá buscar con el DAO con o sin Respuestas y que el componente vea si hay o no para poner la más relevante a la vista; es buena esa.
					p=>new Pregunta(p,modal,req.session).render(),
					preguntas
					)
					]
			});
			
			res.send(pagina.render());
		})
	} catch (error) {
		console.error(error);
		res.status(500).send('Error interno del servidor');
	}
});





router.get("/perfil/info", (req, res) => {
	try {
			
		if (!req.session.usuario) {
			res.status(404).send('No está autorizado');
			return;
		}

		let pagina= PaginaPerfilPropioInfo(req.path, req.session);
		res.send(pagina.render());
		return;
	
	}catch(error){
        console.error(error);
        res.status(500).send('Error interno del servidor');
	}

});




router.get('/administracion/usuarios',(req,res)=>{
	let usu=req.session.usuario;
	// TODO Security: Permisos. Acá y en todos lados.

	// TODO Refactor: Página. Un método que se encargue de la paginación, los límites, los filtros, la agrupación, los datos extra (cantidadDeReportes)
	/* let usuariosReportados=UsuarioDAO.findAll({
		include:[
			{
				model:BloqueoDAO
				,as:'bloqueosRecibidos'
				,attributes:[]
				,where:{
					fecha_desbloqueo:{[Sequelize.Op.is]:null}
				}
			}
			,{
				model:ReportesUsuarioDAO
				,as:'reportesRecibidos'
				,attributes:[]
				,required:true
			}
		]
		,attributes:[
			'DNI'
			,'nombre'
			,[Sequelize.literal('MAX(reportesRecibidos.fecha)'),'fechaUltimoReporte']
			,[Sequelize.literal( `COUNT(*)` ),`cantidadDeReportes`]
		]
		,group:[
			'DNI'
			,'nombre'
		]
	}); */
	/* let usuariosReportados=ReportesUsuarioDAO.findAll({
		subQuery:false
		,include:[
			{
				model:UsuarioDAO
				,as:'reportado'
				,attributes:[]
				,include:[
					{
						model:BloqueoDAO
						,as:'bloqueosRecibidos'
						,attributes:[]
					}
				]
			}
		]
		,attributes:[
			'reportado.DNI'
			,'reportado.nombre'
			,[Sequelize.literal('MAX(reporteUsuarios.fecha)'),'fechaUltimoReporte']
			,[Sequelize.literal( `COUNT(*)` ),`cantidadDeReportes`]
		]
		,group:[
			'reportado.DNI'
			,'reportado.nombre'
		]
		// ,where:{
		// 	[Sequelize.or]:[
		// 		{'$Usuario.Bloqueo':{[Sequelize.Op.is]:null}}
		// 		,{'$Usuario.Bloqueo.fecha_desbloqueo$':{[Sequelize.Op.not]:null}}
		// 	]
		// }
		,order:[['fecha','DESC']]
		,limit:15
	}); */

  let pagina=PantallaAdministracionUsuarios(req.path,req.session);
  res.send(pagina.render());
})

router.get('/perfil/preguntas',(req, res) => {
	try {
			
		if (!req.session.usuario) {
			res.status(404).send('No está autorizado');
			return;
		}
		let filtro={duenioID:null};
		filtro.duenioID =req.session.usuario.DNI;
		PreguntaDAO.pagina(filtro)
			.then(pre=>{
				let pagina = PaginaPerfilPropioPreguntas(req.path,req.session);
				pagina.partes[1]/* ! DesplazamientoInfinito */.entidadesIniciales=pre;

				res.send(pagina.render());
				});
	
	}catch(error){
        console.error(error);
        res.status(500).send('Error interno del servidor');
	}
})

// TODO Refactor: Ver si se puede unificar el algoritmo de prefil/preguntas y perfil/respuestas
router.get('/perfil/respuestas',(req, res) => {
	try {
			
		if (!req.session.usuario) {
			res.status(404).send('No está autorizado');
			return;
		}
		let filtro={DNI:null};
		filtro.DNI =req.session.usuario.DNI;
		RespuestaDAO.pagina(filtro)
			.then(pre=>{
				let pagina = PaginaPerfilPropioRespuestas(req.path,req.session);
				pagina.partes[1]/* ! DesplazamientoInfinito */.entidadesIniciales=pre;

				res.send(pagina.render());
				});
	
	}catch(error){
        console.error(error);
        res.status(500).send('Error interno del servidor');
	}
})


router.get("/perfil/:id?", async (req, res) => {
	// TODO Feature: Ordenar posts por fecha
	/* TODO Feature: si no hay ID, es el propio; si hay ID, solo lectura y posts */
	// TODO Refactor: ver si es posible simplificar casos.
	// TODO Refactor: DNI en vez de id
	try {
		let usu;
		if(req.params.id && req.session.usuario && (req.params.id == req.session.usuario.DNI)){
			//PERFIL PROPIO DE USUARIO LOGUEADO
			usu = req.session.usuario;
			
			if (!usu) {
				res.status(404).send('Error con el perfil propio');
				return;
			}

			let pagina= PaginaPerfilPropioInfo(req.path, req.session);
			res.send(pagina.render());
			return;
	
		}else if(req.params.id){

			// LOGUEADO BUSCANDO OTRO USUARIO
			usu = await UsuarioDAO.findByPk(req.params.id,{
				include:PerfilDAO
			});
			if (!usu) {
				res.status(404).send('Error con el perfil del otro usuario');
				return;
			}

			let filtro={duenioID:null};
		filtro.duenioID =usu.DNI;
		// * Acá sí pedimos antes de mandar para que cargué más rápido y se sienta mejor.
		PreguntaDAO.pagina(filtro)
			.then(pre=>{
				let pagina = PaginaPerfil(req.path,req.session, usu)
				pagina.partes[2]/* ! DesplazamientoInfinito */.entidadesIniciales=pre;

				res.send(pagina.render());
				});

		}else if(req.params.id && !req.session.usuario){

			//  NO LOGUEADO BUSCANDO OTRO USUARIO
			usu = await UsuarioDAO.findByPk(req.params.id);
			if (!usu) {
				res.status(404).send('Error al acceder a un perfil');
				return;
			}

			let filtro={duenioID:null};
		filtro.duenioID =usu.DNI;
		// * Acá sí pedimos antes de mandar para que cargué más rápido y se sienta mejor.
		PreguntaDAO.pagina(filtro)
			.then(pre=>{
				let pagina = PaginaPerfil(req.path,req.session, usu)
				pagina.partes[2]/* ! DesplazamientoInfinito */.entidadesIniciales=pre;

				res.send(pagina.render());
				});


		}else if(req.session.usuario && !req.params.id){

			usu= req.session.usuario;
			if (!usu) {
				res.status(404).send('Estas logueado?');
				return;
			}
			let pagina= PaginaPerfilPropioInfo(req.path, req.session);
			res.send(pagina.render());
			return;

		}else{
			res.status(404).send('No se encuentra autorizado para ver esta pagina');
			return;
		}
	}catch(error){
        console.error(error);
        res.status(500).send('Error interno del servidor');
	}

});

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


router.get("/administracion/perfiles", async (req, res) =>{
	let pagina=PantallaAdministracionPerfiles(req.path,req.session);
				res.send(pagina.render());
})

// Ruta Para búsqueda
// Solo muestra el formulario de búsqueda
// ToDo Feature 
// Se puede implementar que se muestren preguntas recientes... etc
router.get("/explorar", (req, res) => {
	if(req.query.searchInput){
		// TODO Refactor: Ver si req.url es lo que esperamos (la dirección completa con parámetros)
		let queryString = req.url.substring(req.url.indexOf('?'));
		let filtro=[];
		filtro.texto=req.query.searchInput;
		let filtros={filtrar:filtro};
		
		// * Acá sí pedimos antes de mandar para que cargué más rápido y se sienta mejor.
		PreguntaDAO.pagina(filtros)

			.then(pre=>{
					let pagina=PaginaInicio(req.session, queryString);
					pagina.titulo="Explorar"
					pagina.partes[2]/* ! DesplazamientoInfinito */.entidadesIniciales=pre;

					res.send(pagina.render());
				});
	}else{
		let pagina = new Pagina({
		ruta: req.path,
		titulo: "Explorar",
		sesion: req.session,
		});
		pagina.partes.push(new Busqueda())
		res.send(pagina.render());
}
  });
  

// RUTA DE PRUEBA PARA PROBAR
   router.get("/prueba/mensaje", async (req, res) =>  {
    try {
        
		let pagina = new Pagina({
            ruta: req.path,
            titulo: 'Prueba de Formulario',
            sesion: req.session
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