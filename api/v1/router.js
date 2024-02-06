import * as express from "express";
import * as bcrypt from "bcrypt";
const router = express.Router();
import {
	Usuario
	, Perfil
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
  , EtiquetasPregunta
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
	Usuario.findByPk(req.body.DNI)
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
	//TODO Feature: permisos
	if(!req.session.usuario){
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}

	Usuario.findAll({
		where:{
			nombre:{[Sequelize.Op.substring]: req.body.nombre}
		},
		limit:PAGINACION.resultadosPorPagina,
		offset:(+req.body.pagina)*PAGINACION.resultadosPorPagina
	}).then(usuarios=>{
		if(usuarios.length==0){
			res.status(404).send("No se encontraron usuarios");
			return;
		}else{
			res.status(200).send(usuarios);
		}
	})
	.catch(err=>{
        res.status(500).send(err);
    })  
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
		console.log(err);
        res.status(500).send(err);
    })  
})

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
	// ! Siempre pedir el Post, por más que no se consulten los datos.

	// TODO Feature: Aceptar etiquetas y filtro de texto. https://masteringjs.io/tutorials/express/query-parameters

		let filtros={pagina:null,filtrar:[]};
		
		if(req.query.pagina){
			filtros.pagina=req.query.pagina;
		}
		if(req.query.searchInput)
		{
			filtros.filtrar.texto=req.query.searchInput;
		}
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

	// TODO Feature: ver si anda lo de match, y lo del or  quizá haya que poner tabla.columna en vez de solo las columnas
	//hice union atada con alambre, ver cuan lento es
	//al ser distintas tablas no puedo hacer un unico indice con las dos columnas
	Pregunta.findAll({
		where:	Sequelize.or(
				Sequelize.literal('match(cuerpo) against ("'+req.query.filtro+'")'),
				Sequelize.literal('match(titulo) against ("'+req.query.filtro+'")')	
				)
		,
		order:[
			[Post,'fecha','DESC']
		]
		,limit:PAGINACION.resultadosPorPagina,
		offset:(+req.query.pagina)*PAGINACION.resultadosPorPagina,
		include:Post
	})
		.then(preguntas=>{
			res.status(200).send(preguntas);
		})
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
					//no se porque pero asi anda pregunta.save() no
					pregunta.post.save();
					//etiquetas vienen los id en array
					pregunta.setEtiquetas(req.body.etiquetasIDs.map(ID=>new Etiqueta({ID})));
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
	moderarWithRetry(req.body.titulo + " " + req.body.cuerpo, 10).then(respuesta=>{
		if(respuesta.apropiado < rechazaPost){
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
				if(respuesta.apropiado < reportaPost){
					//testeado atado con alambre anda, habria que buscar un mensaje que caiga en esta
					ReportePost.create({
						reportadoID: post.ID})
				}
				//etiquetas
				//asumo que vienen en el body en un array con los id (a chequear)
				pregunta.setEtiquetas(req.body.etiquetasIDs.map(ID=>new Etiqueta({ID})));
				
				//Suscribe a su propia pregunta

				pregunta.addSuscriptos(req.session.usuario.DNI);

				//notificaciones
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
				
				// ! Sin las comillas se piensa que pusimos el status dentro del send
				res.status(201).send(post.ID+"");
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

const valorarPost=function(req,res) {
	//res tendría idpregunta 
	//la valoracion(true es positiva, false negativa) 
	//el usuario viene con la sesión

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
							Voto.create({
								valoracion: req.body.valoracion,
								votadoID:IDvotado,
								votanteDNI:req.session.usuario.DNI
							}).then(v=>v.save());
					}
					}else{
						voto.valoracion=req.body.valoracion;
						voto.save();
						//Notificación

						Notificacion.create({
							postNotificadoID:post.ID,
							notificadoDNI:post.duenioDNI
						})
						

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
						res.status.status(403).send("No existe la valoración")
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
		//Falta lo de permisos
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
		//Falta lo de permisos
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
	Etiqueta.findAll({
		raw:true,
		nest:true
	}).then(etiquetas=>{
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
	//ppregunta ajena es notificacion por etiqueta suscripta 
	//respuesta ajena es notificacion por respuesta a pregunta propia o suscripta
	//respuesta o pregunta propia es notificación por valoración
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
			attributes: ['ID', 'cuerpo'],
			required:true,
			include: [
			  { model: Usuario, as: 'duenio', attributes: ['DNI', 'nombre'] }, 
			  { model: Respuesta, as: 'respuesta', 
				include: [
				  { model: Pregunta, as: 'pregunta', attributes: ['ID', 'titulo'] } // *Include Pregunta in Respuesta
				],
				required: false,
				attributes: ['ID', 'preguntaID'] 
			  },  
			  { model: Pregunta, as: 'pregunta', required: false, attributes: ['ID', 'titulo'] } 
			]
		  }
		],
		where: {
		  //'$post.pregunta.ID$': { [Sequelize.Op.ne]: null }, // *Check if the post is a question
		  notificadoDNI: req.session.usuario.DNI // *Filter by notificadoDNI matching user's DNI
		},
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

/* router.get('/',(req,res)=>{
	// retornar estado de la api, disponible o no
}) */

export {router};