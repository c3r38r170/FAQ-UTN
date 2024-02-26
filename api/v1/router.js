import * as express from "express";
import * as bcrypt from "bcrypt";
const router = express.Router();
import {
	Usuario
	, Perfil
	, Permiso
	, Voto
	, ReportePost
	,Pregunta
	, SuscripcionesPregunta
	, ReportesUsuario
	, Post
	, Respuesta
	, Etiqueta
	, SuscripcionesEtiqueta
	, Notificacion
  , EtiquetasPregunta,
	Categoria
	,Carrera
	,Bloqueo
} from "./model.js";
import { Sequelize } from "sequelize";
import {moderar, moderarWithRetry} from "./ia.js";

// TODO Refactor: ¿Sacar y poner en models.js? Así el modelo se encarga de la paginación, y a los controladores no les importa.
const PAGINACION={
	resultadosPorPagina:10
}

const rechazaPost = 40;
const reportaPost = 70;

// sesiones

router.post('/sesion', function(req, res) {
	let usuario;
	Usuario.findByPk(req.body.DNI,{
		include:{
			model: Perfil,
			include:Permiso
		}
	})
		.then(usu=>{
			if(!usu){
				res.status(404).send('El DNI no se encuentra registrado.');
				return;
			}else{
				usuario=usu;
				return bcrypt.compare(req.body.contrasenia,usu.contrasenia); 
			}
		})
		.then(coinciden=>{
			if(coinciden){
				req.session.usuario=usuario;
				res.status(200).send();
				return;
			}else if(coinciden==false){ //si salió por el 404 coinciden queda undefined
				res.status(401).send('Contraseña incorrecta.');
				return;
			}
		})
		.catch(err=>{
			res.status(500).send(err);
			return;
		})
})
router.delete('/sesion', function(req, res) {
	req.session.destroy();
	res.status(200).send()
})

// usuario

router.get('/usuario', function(req,res){
	
	if(!req.session.usuario){
		res.status(401).send("No se posee sesión válida activa");
		return;
	}
	else if(req.session.usuario.perfil.permiso.ID < 2){
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}

	// TODO Feature: Considerar siempre los bloqueos, y el perfil. Recoger ejemplos (y quizás, normalizarlos) de estas inclusiones

	let opciones={
		subQuery: false,
		limit:PAGINACION.resultadosPorPagina,
		offset:(+req.query.pagina||0)*PAGINACION.resultadosPorPagina,
		attributes:['nombre','DNI','correo','fecha_alta'/* ,'perfilID' Si se quiere el perfil, traer todo, no solo la ID... */]
	};

	let include=[]
		,where={}
		,order=[];

	if(+req.query.reportados){
		include.push(
			{
				model:Bloqueo
				,as:'bloqueosRecibidos'
				// TODO Feature: Traer quién bloqueó y razón.
				,attributes:['motivo']
				,where:{
					fecha_desbloqueo:{[Sequelize.Op.is]:null}
				}
				,required:false
			}
			,{
				model:ReportesUsuario
				,as:'reportesRecibidos'
				,attributes:['fecha']
				,required:true
			}
		);
		order.push([Sequelize.col('reportesRecibidos.fecha'),'DESC']);
	}
	let filtro=req.query.filtro;
	if(filtro){
		where.DNI={[Sequelize.Op.substring]: filtro};
		where.nombre={[Sequelize.Op.substring]: filtro};
		include.push(Carrera);
		where['$carrera.legajo$']={[Sequelize.Op.substring]: filtro};
	}

	if(include.length){
		opciones.include=include;
	}
	if(Object.keys(where).length){
		opciones.where=where;
	}
	opciones.order=[...order,['DNI','ASC']];

	// console.log(opciones);

	Usuario.findAll(opciones).then(usuarios=>{
		// console.log(usuarios);
		if(usuarios.length==0 && filtro){
			res.status(404).send("No se encontraron usuarios");
		}else{
			res.status(200).send(usuarios);
		}
	})
	.catch(err=>{
        res.status(500).send(err);
    })  
})

router.get('/usuario/:DNI/preguntas', function(req, res){
	let filtros={pagina:null,duenioID:null};
		filtros.duenioID=req.params.DNI
		filtros.pagina=req.query.pagina
		// console.log(filtros);
		Pregunta.pagina(filtros)
		// Pregunta.findAll(opciones)
			.then(preguntas=>{
				res.status(200).send(preguntas)
			})
			.catch(err=>{
				console.log(err)
			});
	// }
	return;
})

router.get('/usuario/:DNI/posts', function(req, res){
	let filtros={pagina:null,DNI:req.params.DNI};
		if(req.query.pagina){
			filtros.pagina=req.query.pagina;
		}

	Post.pagina(filtros).then(posts=>res.send(posts))
})

router.get('/usuario/:DNI/respuestas', function(req, res){
	let filtros={pagina:null,DNI:req.params.DNI};
	let pagina = 0;
		if(req.query.pagina){
			filtros.pagina=req.query.pagina;
			pagina = req.query.pagina;
		}

		Respuesta.pagina(filtros).then(posts=>res.send(posts.slice((+pagina)*PAGINACION.resultadosPorPagina,(1+pagina)*PAGINACION.resultadosPorPagina )))
	//Respuesta.pagina(filtros).then(respuestas=>res.send(respuestas))
})

router.post('/usuario', (req,res)=>{
	Usuario.findAll({
		where:{DNI:req.body.DNI}
		, raw:true, nest:true,
		plain:true
	})
    .then(usu=>{
        if(!usu){
            Usuario.create({
                nombre: req.body.nombre,
                DNI: req.body.DNI,
                correo: req.body.correo,
                contrasenia: req.body.contrasenia
            })
            res.status(200).send('Registro exitoso');
            return;
        }
        res.status(400).send('El Usuario ya se encuentra registrado');
    })
    .catch(err=>{
        res.status(500).send(err);
    })        
});

router.post('/usuario/:DNI/contrasenia',function(req,res){
    function generarContrasenia() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }

    Usuario.findByPk(req.params.DNI)
    .then(usu=>{
        if(!usu){
            res.status(404).send('DNI inexistente')
            return;
        }
			let contraseniaNueva = generarContrasenia();
			usu.contrasenia= contraseniaNueva;

			//TODO Feature: mandar mail
			usu.save().then(res.status(200).send('DNI encontrado, correo enviado'));
    })
});

router.post('/usuario/:DNI/reporte', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Usuario.findByPk(req.params.DNI).then(usuario=>{
		if(!usuario){
			res.status(404).send("Usuario no encontrado");
			return;
		}else{
			// TODO Refactor: Usar Sequelize, usuario.addReporteUsuario(new ReporteUsuario({reportante: ... o como sea }))
			ReportesUsuario.create({
				usuarioReportanteDNI: req.session.usuario.DNI,
				usuarioReportadoDNI: req.params.DNI
			});
			
			res.status(201).send("Reporte registrado")
		}
	})
    .catch(err=>{
			// TODO Refactor: Sacar todos estos console log.
		console.log(err);
        res.status(500).send(err);
    })  
})

router.post('/usuario/:DNI/bloqueo', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	// TODO Security: Chequear permisos
	// TODO Feature: Comprobar que exista req.body.motivo

	Usuario
		.findByPk(req.params.DNI,{
			include:[
				{
					model:Bloqueo
					,as:'bloqueosRecibidos'
					,where:{fecha_desbloqueo:{[Sequelize.Op.is]:null}}
					,required:false
				}
			]
		})
		.then(usuario=>{
			if(!usuario){
				res.status(404).send("Usuario no encontrado");
				return;
			}
			
			// TODO Refactor: Ver si viene igual el array o no.
			let mensaje="Usuario bloqueado.";
			if(!usuario.bloqueosRecibidos?.length){
				let bloqueo=new Bloqueo({
					motivo:req.body.motivo
				});
				bloqueo.save()
					.then(()=>{
						Promise.all([
							Usuario
								.findByPk(req.session.usuario.DNI)
								.then((usuarioActual)=>usuarioActual.addBloqueosRealizados(bloqueo))
								.then((usuarioActual)=>usuarioActual.save())
							,usuario
								.addBloqueosRecibidos(bloqueo)
								.then(()=>usuario.save())
						])
							.then(()=>{
								res.status(201).send(mensaje);
							});
					})

			}else res.status(200).send(mensaje);
		})
    .catch(err=>{
		console.log(err);
        res.status(500).send(err);
    });
});

router.delete('/usuario/:DNI/bloqueo', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	// TODO Security: Chequear permisos
	// TODO Feature: Comprobar que exista req.body.motivo

	Usuario
		.findByPk(req.params.DNI,{
			include:[
				{
					model:Bloqueo
					,as:'bloqueosRecibidos'
					,where:{fecha_desbloqueo:{[Sequelize.Op.is]:null}}
					,required:false
				}
			]
		})
		.then(usuario=>{
			if(!usuario){
				res.status(404).send("Usuario no encontrado");
				return;
			}
			
			// TODO Refactor: Ver si viene igual el array o no.
			let mensaje="Usuario desbloqueado.";
			if(usuario.bloqueosRecibidos?.length){
				let bloqueo=usuario.bloqueosRecibidos[0];
				bloqueo.motivo_desbloqueo=req.body.motivo;
				bloqueo.fecha_desbloqueo=new Date;
				bloqueo.save()
					.then(()=>Usuario.findByPk(req.session.usuario.DNI))
					.then((usuarioActual)=>usuarioActual.addDesbloqueosRealizados(bloqueo))
					.then((usuarioActual)=>usuarioActual.save())
					.then(()=>{
						res.status(201).send(mensaje);
					})
			}
		});
});

router.patch('/usuario', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Usuario.findByPk(
			req.session.usuario.DNI,	
		).then(usuario=>{
		//TODO Feature: definir que mas puede cambiar y que constituye datos inválidos
		usuario.contrasenia=req.body.contrasenia;
		usuario.save();
		res.status(200).send("Datos actualizados exitosamente");
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
})

// posts
//preguntas

// TODO Refactor: Ver si consultas GET aceptan body, o hay que poner las cosas en la URL (chequear proyecto de TTADS)
router.get('/pregunta',(req,res)=>{
	// TODO Refactor: Mandar este comentario a Pregunta.pagina
	// ! Siempre pedir el Post, por más que no se consulten los datos.

	// TODO Feature: Aceptar etiquetas y filtro de texto. https://masteringjs.io/tutorials/express/query-parameters

		let filtros={pagina:null,filtrar:[]};
		
		// TODO Refactor: pagina es obligatorio; y si no está, sería 0. `pagina:req.query.pagina||0`
		if(req.query.pagina){
			filtros.pagina=req.query.pagina;
		}
		if(req.query.searchInput)
		{
			filtros.filtrar.texto=req.query.searchInput;
		}

		Pregunta.pagina(filtros)
		.then(preguntas=>{
			res.status(200).send(preguntas)
		})
		.catch(err=>{
			console.log(err)
		});
})

router.patch('/pregunta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.")
	}
	Pregunta.findByPk(req.body.ID, {
		include:Post
	}).then(pregunta=>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada");
			return;
		}else{
			if(pregunta.post.duenioDNI!=req.session.usuario.DNI){
				res.status(403).send("No puede editar una pregunta ajena.");
				return;
			}else{
				moderarWithRetry((req.body.titulo + " " + req.body.cuerpo),10).then(respuesta=>{
					if(respuesta.apropiado < rechazaPost){
						res.status(400).send("Texto rechazo por moderación automática");
						return;
					}else if(respuesta.apropiado<reportaPost){
						//Crear reporte
						//TODO Feature: definir tipo y definir si ponemos como reportanteID algo que represente al sistema o se encarga el front (Santiago: Yo digo dejarlo NULL y que se encargue el frontend.)
						ReportePost.create({
							reportadoID: pregunta.ID
						});
					}
					//si pasa el filtro
					pregunta.post.cuerpo=req.body.cuerpo;
					pregunta.titulo=req.body.titulo;
					//etiquetas vienen los id en array
					pregunta.setEtiquetas(req.body.etiquetasIDs.map(ID=>new EtiquetasPregunta({etiquetumID: ID})));
					//no se porque pero asi anda pregunta.save() no
					pregunta.post.save();
					res.status(200).send("Pregunta actualizada exitosamente");
				});
				
			}
		}
	})
    .catch(err=>{
		console.log(err);
        res.status(500).send(err);
    })  
})


router.post('/pregunta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	//A veces crashea la ia
	moderarWithRetry(req.body.titulo + " " + req.body.cuerpo, 10).then(respuestaIA=>{
		if(respuestaIA.apropiado < rechazaPost){
			//esto anda
			res.status(400).send("Texto rechazo por moderación automática");
			return;
		}
		Post.create({
			cuerpo: req.body.cuerpo,
			duenioDNI: req.session.usuario.DNI
		}).then(post=>{
			Pregunta.create({
				ID: post.ID,
				titulo: req.body.titulo
			}).then((pregunta)=>{
				let esperarA=[];

				if(respuestaIA.apropiado < reportaPost){
					// TODO Feature testeado atado con alambre anda, habria que buscar un mensaje que caiga en esta
					esperarA.push(ReportePost.create({
						reportadoID: post.ID}));
				}

				//etiquetas
				
/* req.body.etiquetasIDs.forEach(id=>{
							EtiquetasPregunta.create({
								'preguntumID':post.ID,
								'etiquetumID':id
							})
						}) */

				esperarA.push(
					Promise.all(req.body.etiquetasIDs.map(ID=>Etiqueta.findByPk(ID)))
						.then(etiquetas=>Promise.all(etiquetas.map(eti=>{
							let ep=new EtiquetasPregunta();
							ep.etiqueta=eti;
							return ep.save();
						})))
						.then(eps=>pregunta.setEtiquetas(eps))
				)
				
					//Suscribe a su propia pregunta
					
					esperarA.push(
						Usuario.findByPk(req.session.usuario.DNI)
							.then(usu=>pregunta.addUsuariosSuscriptos(usu))
					)

				//notificaciones
				if(req.body.etiquetasIDs)
					esperarA.push(
						SuscripcionesEtiqueta.findAll({
							attributes: ['suscriptoDNI'],
							where: {
								etiquetaID: {
								[Sequelize.Op.in]: req.body.etiquetasIDs
								},
								fecha_baja: null
							},
							distinct: true
							}).then(suscripciones=>{
							suscripciones.forEach(suscripcion => {
								Notificacion.create({
									postNotificadoID:post.ID,
									notificadoDNI:suscripcion.suscriptoDNI
								})
							});
						})
					);
				
				Promise.all(esperarA)
					.then(()=>pregunta.save())
					.then(() => {
						// ! Sin las comillas se piensa que pusimos el status dentro del send
						res.status(201).send(post.ID+"");
					})
			})
			.catch(err=>{
				console.log(err);
				res.status(500).send(err);
			})
		})
	})
	.catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
})

//Suscripción / desuscripción a pregunta

router.post('/pregunta/:preguntaID/suscripcion', function(req,res){
	//TODO Feature: acomodar el filtro para que no encuentre suscripciones dadas de baja
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let IDpregunta=req.params.preguntaID;

	Pregunta.findByPk(IDpregunta, {include:Post}).then(pregunta =>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada / disponible");
			return;
		}else{
			// TODO Refactor: Esto no hace falta, se puede hacer pregunta.SuscripcionesPregunta o algo así
			SuscripcionesPregunta.findAll({
				where:{
					preguntaID: IDpregunta,
					suscriptoDNI: req.session.usuario.DNI,
					fecha_baja:{
						[Sequelize.Op.is]:null
					}
				}, 
				nest:true,
				plain:true
			}).then(sus=>{
				if(!sus){
					SuscripcionesPregunta.create({
						suscriptoDNI: req.session.usuario.DNI,
						preguntaID: IDpregunta
					}).then(susc=>susc.save());
					res.status(201).send("Suscripción creada");
					return;
				}else{
					
					res.status(401).send("Ya se encuentra suscripto a la pregunta");
				}
			})
			.catch(err=>{
				console.log(err);
				res.status(500).send(err);
			})  
		}
	})
	.catch(err=>{
		console.log(err);
        res.status(500).send(err);
    })  
		// TODO Refactor: ahorrar el callback hell, acá y en todos lados.
})

router.get('/suscripciones', function(req,res){
	//TODO Feature: acomodar el filtro para que no encuentre suscripciones dadas de baja. fecha_baja, ver si conviene volver a las relaciones como antes...
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	// TODO Feature Poner en Pregunta.pagina para tener también las suscripciones (aca hace falta?? sabemos que todas estas lo incluyen, quizá poner en el frontend. Esto haría un parámetro de si hacen falta los votos o no)
	// TODO Feature Usar Pregunta.pagina para tener todos los datos unificados, como los votos

	const pagina = req.query.pagina || 0;
	Pregunta.findAll({
		include:[
			{
				model: Post,
				as: 'post',
				include: [
					{
						model: Usuario,
						as: 'duenio'
					}
				]
			},
			{
				model: EtiquetasPregunta,
				as:'etiquetas',
				include:Etiqueta
			},
			{
			model:Usuario
				,where:{
					DNI:req.session.usuario.DNI
					// fecha_baja:NULL
			}
			,as: 'usuariosSuscriptos'
			}],subQuery:false,
            order:[[Post,'fecha','DESC']],
            limit:PAGINACION.resultadosPorPagina,
            offset:(+pagina)*PAGINACION.resultadosPorPagina,
	})
		.then((suscripciones)=>{
			if(!suscripciones){
				res.status(404).send("No se encontraron suscripciones");
				return;
			}else{
				res.status(200).send(suscripciones);
			}
		})
		.catch(err=>{
        res.status(500).send(err);
    })  
})

router.delete('/pregunta/:preguntaID/suscripcion', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let IDpregunta=req.params.preguntaID;

	Pregunta.findByPk(IDpregunta, {include:Post}).then(pregunta =>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada / disponible");
			return;
		}else{
			// TODO Refactor: Esto no hace falta, se puede hacer pregunta.SuscripcionesPregunta o algo así
			SuscripcionesPregunta.findAll({
				where:{
					preguntaID: IDpregunta,
					suscriptoDNI: req.session.usuario.DNI,
					fecha_baja:{
						[Sequelize.Op.is]:null
					}
				}, 
				nest:true,
				plain:true
			}).then(sus=>{
				if(!sus){
					res.status(401).send("No se encuentra suscripto a la pregunta");
					return;
				}else{
					sus.fecha_baja= new Date().toISOString().split('T')[0];
					sus.save();
					//devuelve el 204 pero no el mensaje
					res.status(201).send("Suscripción cancelada");
				}
			})
			.catch(err=>{
				console.log(err);
				res.status(500).send(err);
			})  
		}
	})
	.catch(err=>{
		console.log(err);
        res.status(500).send(err);
    })  
})

//respuesta

router.post('/respuesta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	moderarWithRetry(req.body.cuerpo,10).then(respuesta=>{
		if(respuesta.apropiado < rechazaPost){
			// TODO Feature: ¿Devolver razón? Si se decidió que no, está bien.
			res.status(400).send("Texto rechazo por moderación automática");
			return;
		}
	
		// TODO Refactor: Quizá sea más facil usar yield para esta parte, o ir devolviendo las premisas. O ambas cosas.
		Pregunta.findByPk(req.body.IDPregunta,
			{
				include:Post
			})
		.then(pregunta=>{
			if(!pregunta){
				res.status(404).send("Pregunta no encontrada / disponible")
			}else{
				Post.create({
					cuerpo: req.body.cuerpo,
					duenioDNI: req.session.usuario.DNI
				}).then(post=>{
					Respuesta.create({
						ID: post.ID,
						preguntaID: req.body.IDPregunta
					}).then((resp)=>{
						if(respuesta.apropiado < reportaPost){
							ReportePost.create({
								reportadoID: post.ID})
						}
						resp.save();

						//Notificaciones
						//al suscripto al post le avisa que se respondió y le manda el id de la respuesta
						SuscripcionesPregunta.findAll({
							where: {
							  preguntaID: req.body.IDPregunta,
							  fecha_baja: null,
							  suscriptoDNI: { [Sequelize.Op.ne]: req.session.usuario.DNI} 
							}
						  }).then(suscripciones=>{
							console.log('Suscripciones:',suscripciones);
							suscripciones.forEach(suscripcion => {
								Notificacion.create({
									postNotificadoID:post.ID,
									notificadoDNI:suscripcion.suscriptoDNI
								})
							});
						})


						//si adentro de send hay un int tira error porque piensa que es el status
						res.status(201).send(post.ID+"");
					})
					.catch(err=>{
						console.log(err);
						res.status(500).send(err);
					})
				})
				.catch(err=>{
					console.log(err);
					res.status(500).send(err);
				})
			}
		})
	})
	.catch(err=>{
		res.status(500).send(err);
	})
})

router.patch('/respuesta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.")
	}
	Respuesta.findByPk(req.body.ID,	{
		include:Post
	}).then(respuesta=>{
		if(!respuesta){
			res.status(404).send("Respuesta no encontrada");
			return;
		}else{
			if(respuesta.post.duenioDNI!=req.session.usuario.DNI){
				res.status(403).send("No puede editar una respuesta ajena.");
				return;
			}else{
				//filtro IA
				moderarWithRetry(req.body.cuerpo,10).then(resp=>{
					if(resp.apropiado < rechazaPost){
						res.status(400).send("Texto rechazo por moderación automática");
						return;
					}else if(resp.apropiado<reportaPost){
						//Crear reporte
						//TODO Feature: definir tipo y definir si ponemos como reportanteID algo que represente al sistema o se encarga el front
						ReportePost.create({
							reportadoID: respuesta.ID
						});
					}
					//pasa el filtro
					respuesta.cuerpo=req.body.cuerpo;
					respuesta.save();
					res.status(200).send("Respuesta actualizada exitosamente");
				})
				
			}
		}
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
})

// valoracion
// TODO Feature: No permitir autovotarse.

const valorarPost=function(req,res) {
	//res tendría idpregunta 
	//la valoracion(true es positiva, false negativa) 
	//el usuario viene con la sesión
	//TODO: Refactor en vez de borrar el voto ponerle un campo, asi creamos la noti solo si el voto es nuevo, no si te vuelve loco poniendo y sacando

	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.");
		return;
	}

	// TODO Refactor: ver si es posible traer solo un si existe
	let IDvotado=req.params.votadoID;
	
	Post.findByPk(IDvotado).then(post=>{
			if(!post){
				res.status(404).send("Post no encontrado / disponible.");
				return;
			}else{
				Voto.findAll({where:{
					votadoID:IDvotado,
					votanteDNI:req.session.usuario.DNI
					},
					nest:true,
					plain:true
				}).then(voto=>{
					if(!voto){
						// si no exite el voto lo crea con lo que mandó
						if(req.body.valoracion=="null"){
							res.status(403).send("No existe la valoracion")
						}else{
							if(req.body.valoracion){
								Voto.create({
									valoracion: req.body.valoracion,
									votadoID:IDvotado,
									votanteDNI:req.session.usuario.DNI
								}).then(v=>v.save());
								Notificacion.create({
									postNotificadoID:post.ID,
									notificadoDNI:post.duenioDNI
								})
						}
					}
					}else{
						voto.valoracion=req.body.valoracion;
						voto.save();
						//Notificación

						
						

					}
					res.status(201).send("Voto registrado.")
				})
			}
	})
	.catch(err=>{
		res.status(500).send(err);
	})  
};

const eliminarVoto=function(req,res) {
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.");
		return;
	}
	let IDvotado=req.params.votadoID;
	Post.findByPk(IDvotado).then(post=>{
			if(!post){
				res.status(404).send("Post no encontrado / disponible.");
				return;
			}else{
				Voto.findAll({where:{
					votadoID:IDvotado,
					votanteDNI:req.session.usuario.DNI
					},
					nest:true,
					plain:true
				}).then(voto=>{
					if(!voto){
						res.status(403).send("No existe la valoración")
					}
					else{
						voto.destroy();
					}
					res.status(201).send("Voto Eliminado.")
				})
			}
	})
	.catch(err=>{
		res.status(500).send(err);
	})  
};

router.post('/post/:votadoID/valoracion', valorarPost)

router.delete('/post/:votadoID/valoracion', eliminarVoto)


//reporte post

const reportarPost=function(req, res){
	// TODO Refactor: ocupar la sesión activa válida en el server.js así no hay que repetirlo a cada rato
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let reportadoID=req.params.reportadoID;
	console.log(reportadoID)
	Post.findByPk(reportadoID
	).then(pregunta=>{
		if(!pregunta){
			res.status(404).send("Pregunta/respuesta no encontrada");
			return;
		}else{
			// TODO Feature: ver si ya se reportó, y prohibir 
			// Se podría hacer un get a los reportes y si ya existe que aparezca mensajito de ya está reportado y directamente no te aparezca el form
			// TODO Feature: determinar tipos
			ReportePost.create({
				tipo: req.body.tipo,
				reportante: req.session.usuario.DNI,
				reportado: reportadoID
			}).then(r=>r.save());
			res.status(201).send("Reporte registrado")
		}
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
};

router.post('/post/:reportadoID/reporte', reportarPost);

// TODO Refactor: Moderación de preguntas y respuestas deberían estar repartidas en router.patch('/pregunta') (la unificación) y router.delete('/(pregunta|respuesta))') (eliminación). Para esto hace falta meter bien el tema de los permisos.

//moderación de preguntas y respuestas

router.post('moderacion_pregunta', function(req,res){
	if(!req.session.usuario){
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}
	else if(req.session.usuario.perfil.permiso.ID < 2){
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}
	Post.findAll({
		where:{ID:req.body.IDPost},
		raw:true, nest:true,
		plain:true
	}).then(post=>{
		if(!post){
			res.status(404).send("Pregunta no encontrada/disponible");
			return;
		}else{
			if(req.body.accion == "eliminar"){
				post.setDataValue("eliminadorID", usu.ID);
				res.status(200).send("Estado del post consistente con interfaz");
				return;
			}else if(req.body.accion== "unificar"){
				//TODO Feature: que hacemos aca?
			}else{
				// TODO Feature: Los reportes no se eliminan. Solo se actua sobre ellos (eliminando o unificando) o se ignoran.
				//Eliminamos el reporte? o agregamos algun campo que diga si fue tratado(y por quien)
				ReportePost.findAll({
					where:{ID: req.body.IDReporte},
					raw:true, nest:true,
					plain:true
					}).then(reporte=>{
						if(!reporte){
							res.status(404).send("Reporte no encontrado");
							return;
						}else{
							reporte.destroy();
							res.status(200).send("Estado del post consistente con interfaz");
							return;
						}
					}).catch(err=>{
						res.status(500).send(err);
					})
			}
		}
	}).catch(err=>{
		res.status(500).send(err);
	})
})

//moderación respuestas

router.post('moderacion_respuesta', function(req,res){
	if(!req.session.usuario){
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}
	else if(req.session.usuario.perfil.permiso.ID < 2){
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}
	Post.findAll({
		where:{ID:req.body.IDPost},
		raw:true, nest:true,
		plain:true
	}).then(post=>{
		if(!post){
			res.status(404).send("Respuesta no encontrada/disponible");
			return;
		}else{
			if(req.body.accion == "eliminar"){
				post.setDataValue("eliminadorID", usu.ID);
				res.status(200).send("Estado del post consistente con interfaz");
				return;
			}else{
				//Eliminamos el reporte? o agregamos algun campo que diga si fue tratado(y por quien)
				ReportePost.findAll({
					where:{ID: req.body.IDReporte},
					raw:true, nest:true,
					plain:true
					}).then(reporte=>{
						if(!reporte){
							res.status(404).send("Reporte no encontrado");
							return;
						}else{
							reporte.destroy();
							res.status(200).send("Estado del post consistente con interfaz");
							return;
						}
					}).catch(err=>{
						res.status(500).send(err);
					})
			}
		}
	}).catch(err=>{
		res.status(500).send(err);
	})
})

// etiquetas

router.get('/etiqueta', function(req,res){
	//* sin paginación porque no deberían ser tantas

	// TODO Refactor: Ver si el estandar de REST permite enviar colecciones separadas en casos como este, donde la redundancia es aproximadamente el 50% de la carga. O si hay que hacer endpoint de categorias...
	// TODO Refactor: Quizá directamente pedir categorias ¯\_(ツ)_/¯
	/* Promise.all(
		Etiqueta.findAll({
			raw:true,
			nest:true
		})
		,Categoria.findAll({
			raw:true,
			nest:true
		})
	)
	.then((etiquetas,categorias)=>{
		res.status(200).send({etiquetas,categorias}); */
		// console.log('aaaaa');
	Etiqueta.findAll({
		raw:true,
		nest:true,
		include:[{model:Categoria,as:'categoria'}]
	}).then(etiquetas=>{
		// console.log('bbbbb',etiquetas);
		res.status(200).send(etiquetas);
	}).catch(err=>{
		res.status(500).send(err);
	})
})

router.post('/etiqueta/:etiquetaID/suscripcion', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let IDetiqueta=req.params.etiquetaID;

	Etiqueta.findByPk(
			IDetiqueta
	).then(etiqueta =>{
		if(!etiqueta){
			res.status(404).send("Etiqueta no encontrada / disponible");
			return;
		}else{
			SuscripcionesEtiqueta.findAll({
				where:{
					etiquetaID:IDetiqueta,
					suscriptoDNI: req.session.usuario.DNI,
					fecha_baja:{
						[Sequelize.Op.is]:null
					}
				},
				plain:true
			}).then(sus=>{
				if(!sus){
					SuscripcionesEtiqueta.create({
						suscriptoDNI: req.session.usuario.DNI,
						etiquetaID:IDetiqueta
					}).then(s=>s.save());
					res.status(201).send("Suscripción creada");
					return;
				}else{
					res.status(401).send("Ya se encuentra suscripto a la etiqueta.");
				}
			})
			.catch(err=>{
				res.status(500).send(err);
			})  
		}
	})
	.catch(err=>{
		console.log(err);
        res.status(500).send(err);
    })  
})


router.delete('/etiqueta/:etiquetaID/suscripcion', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let IDetiqueta=req.params.etiquetaID;

	Etiqueta.findByPk(
			IDetiqueta
	).then(etiqueta =>{
		if(!etiqueta){
			res.status(404).send("Etiqueta no encontrada / disponible");
			return;
		}else{
			SuscripcionesEtiqueta.findAll({
				where:{
					etiquetaID:IDetiqueta,
					suscriptoDNI: req.session.usuario.DNI,
					fecha_baja:{
						[Sequelize.Op.is]:null
					}
				},
				plain:true
			}).then(sus=>{
				if(!sus){
					
					res.status(401).send("No se encuentra suscripto a la etiqueta");
					return;
				}else{
					sus.fecha_baja= new Date().toISOString().split('T')[0];
					sus.save();
					res.status(201).send("Suscripción cancelada");
				}
			})
			.catch(err=>{
				res.status(500).send(err);
			})  
		}
	})
	.catch(err=>{
		console.log(err);
        res.status(500).send(err);
    })  
})


//notificaciones

// TODO Refactor: Minimizar datos que envia este endpoint.
// TODO Feature: Hacer que se devuelvan una sola notificacion por pregunta (sí, pregunta)
router.get('/notificacion', function(req,res){
	// pregunta
	// 	propia
	// 		valoraciones, cantidad n
	// 	ajena
	// 		nueva pregunta, siempre es 1, suscripcion a etiqueta
	// respuesta
	// 	propia
	// 		Valoracion, cantidad n
	// 	ajena
	// 		nuevas respuestas, cantidad n, Suscripcion a pregunta

	//ppregunta ajena es notificacion por etiqueta suscripta
		// preguntaID not null es "nueva pregunta a etiqueta"
	//respuesta ajena es notificacion por respuesta a pregunta propia o suscripta
	//respuesta o pregunta propia es notificación por valoración
		// nuevos votos en tu pregunta...
		// nuevos votos en tu respuesta a ...
	if(!req.session.usuario){
		res.status(403).send("No se posee sesión válida activa");
		return;
	}
	Notificacion.findAll({
		attributes: ['ID', 'visto', 'createdAt'],
		order: [
		  ['visto', 'ASC'],
		  ['createdAt', 'DESC']
		],
		limit: PAGINACION.resultadosPorPagina,
		offset: (+req.query.pagina) * PAGINACION.resultadosPorPagina,
		include: [
		  {
			model: Post,
			attributes: [/* 'ID', 'cuerpo' */],
			required:true,
			include: [
			  { model: Usuario, as: 'duenio', attributes: [/* 'DNI', 'nombre' */] }, 
			  { model: Respuesta, as: 'respuesta', 
				include: [
				  { model: Pregunta, as: 'pregunta', attributes: [/* 'ID', 'titulo' */] } // *Include Pregunta in Respuesta
				],
				required: false,
				attributes: [/* 'ID', 'preguntaID' */] 
			  },  
			  { model: Pregunta, as: 'pregunta', required: false, attributes: [/* 'ID', 'titulo' */] } 
			]
		  }
		],
		where: {
		  //'$post.pregunta.ID$': { [Sequelize.Op.ne]: null }, // *Check if the post is a question
		  notificadoDNI: req.session.usuario.DNI // *Filter by notificadoDNI matching user's DNI
		},
		attributes:[
			[Sequelize.fn('min',Sequelize.col('notificacion.visto')),'visto']
			,[Sequelize.fn('max',Sequelize.col('notificacion.createdAt')),'createdAt']
			,[Sequelize.fn('count',Sequelize.col('*')),'cantidad']
			,[Sequelize.literal(`IF(post.duenioDNI='${req.session.usuario.DNI}',1,0)`),'propia']
			,[Sequelize.fn('coalesce',Sequelize.col('post.respuesta.pregunta.titulo'),Sequelize.col('post.pregunta.titulo')),'titulo']
			// ,[Sequelize.literal(`COALESCE(post.respuesta.pregunta.titulo,post.pregunta.titulo)`),'titulo']
			// ,Sequelize.fn.max('createdAt')
			// ,
			// ,['post.respuesta.ID','respuestaID']
			,[Sequelize.col('post.respuesta.preguntaID'),'respuestaPreguntaID']
			,[Sequelize.col('post.pregunta.ID'),'preguntaID']
		],
		group:[
			// 'post.respuesta.ID'
			// ,
			'propia'
			,'post.respuesta.preguntaID'
			,'post.pregunta.ID'
		],
		raw: true,
		nest: true
	  }).then(notificaciones=>{
		res.status(200).send(notificaciones);
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	});
});

router.patch('/notificacion',function(req,res){
	if(!req.session.usuario){
		res.status(402).send();
		return;
	}

	let notificacionID=req.body.ID;
	
	if(!notificacionID){
		res.status(400).send();
		return;
	}

	Notificacion.findByPk(notificacionID)
		.then(notificacion=>{
			if(!notificacion){
				res.status(404).send();
				return;
			}

			if(notificacion.notificadoDNI!=req.session.usuario.DNI){
				res.status(403).send();
				return;
			}

			notificacion.visto=true;
			return notificacion.save();
		})
		.then(()=>{
			res.status(200).send();
		})
		.catch(err=>{
			res.status(500).send(err);
		})
})

// TODO Feature
/* router.get('/',(req,res)=>{
	// retornar estado de la api, disponible o no
}) */

export {router};