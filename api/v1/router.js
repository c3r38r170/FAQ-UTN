import * as express from "express";
import * as bcrypt from "bcrypt";
const router = express.Router();
import {Usuario,Pregunta} from '../api/v1/model.js';
import { ReportePost, SuscripcionesPregunta, Voto } from "./model.js";
import { Sequelize } from "sequelize";
import {moderar} from "../api/v1/ia.js";

// TODO Refactor: ¿Sacar y poner en models.js? Así el modelo se encarga de la paginación, y a los controladores no les importa.
const PAGINACION={
	resultadosPorPagina:10
}

const rechazaPost = 40;
const reportaPost = 70;

// sesiones

router.post('/sesion', function(req, res) {
	let usuario;

	Usuario.findAll({
		where:{DNI:req.body.DNI}
		, raw:true, nest:true,
		plain:true
		,include:{
			all:true
			// TODO Feature: Ver si esto no mata a todo.
		}
	})
		.then(usu=>{
			if(!usu){
				res.status(404).send('El DNI no se encuentra registrado.');
				return;
			}

			usuario=usu;
			return bcrypt.compare(req.body.contrasenia,usu.contrasenia);
		})
		.then(coinciden=>{
			if(coinciden){
				req.session.usuario=usuario;
			}else{
				res.status(401).send('Contraseña incorrecta.');
			}
		})
		.catch(err=>{
			// TODO mensaje representativo
			res.status(500).send(err);
		})
})
router.delete('/sesion', function(req, res) {
	req.session.destroy();
	res.status(200).send()
})

// usuario

router.get('/usuario', function(req,res){
	//TODO Feature: permisos
	//Busca con nombre like? andará eso?
	if(!req.session.usuario){
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}

	Usuario.findAll({
		where:{
			nombre:{[Sequelize.OP.like]: `%${req.body.nombre}%`}
		},
		limit:PAGINACION.resultadosPorPagina,
		offset:(+req.pagina)*PAGINACION.resultadosPorPagina
	}).then(usuarios=>{
		if(!usuarios){
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

const registroCreacion = function(req,res){
	Usuario.findAll({
		where:{DNI:req.body.DNI}
		, raw:true, nest:true,
		plain:true
	})
    .then(usu=>{
        if(!usu){
            Usuario.create({
                nombre: body.req.nombre,
                DNI: body.req.DNI,
                correo: body.req.correo,
                contrasenia: body.req.contrasenia
            })
            res.status(200).send('Registro exitoso');
            return;
        }
        res.status(400).send('El Usuario ya se encuentra registrado');
    })
    .catch(err=>{
        res.status(500).send(err);
    })        
}

router.post('/usuario', registroCreacion);

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

		// TODO Refactor: Ver diferencia entre find y findAll acá. Por DNI debería ser o find o incluso findByPk
    Usuario.find({
		where:{DNI:req.params.DNI}
		, raw:true, nest:true,
		plain:true
	})
    .then(usu=>{
        if(!usu){
            res.status(404).send('DNI inexistente')
            return;
        }
		let contraseniaNueva = generarContrasenia();
		usu.setDataValue('contrasenia', contraseniaNueva);

        //TODO Feature: mandar mail
        res.status(200).send('DNI encontrado, correo enviado')
    })
});

router.post('/usuario/:ID/reporte', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let usuarioID=req.params.ID;
	Usuario.findAll({
		where:{
			ID: usuarioID,	
		}
		, raw:true, nest:true,
		plain:true
	}).then(usuario=>{
		if(!usuario){
			res.status(404).send("Usuario no encontrado");
			return;
		}else{
			// TODO Refactor: Usar Sequelize, usuario.addReporteUsuario(new ReporteUsuario({reportante: ... o como sea }))
			ReportesUsuario.create({
				reportante: req.session.usuario.ID,
				reportado: usuarioID
			});
			res.status(201).send("Reporte registrado")
		}
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
})

router.patch('/usuario', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Usuario.findAll({
		where:{
			ID:usu.ID,	
		}
		, raw:true, nest:true,
		plain:true
	}).then(usuario=>{
		//TODO Feature: definir que mas puede cambiar y que constituye datos inválidos
		usuario.contrasenia=req.body.contrasenia;
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
	// TODO Feature: Aceptar etiquetas y filtro de texto
	// TODO Feature: Considerar el hecho de enviar la cantidad de respuestas y no las respuestas en sí. Quizá con una bandera.

	// TODO Feature: Actualizar Pregunta.pagina así lo puede usar el frontend.
	// Pregunta.pagina(+req.pagina)

	// TODO Refactor: Ir considerando qué filtros poner. Va a haber consultas sin busqueda, por ejemplo.
	// TODO Feature: ver si anda lo de match, y lo del or
	//hice union atada con alambre, ver cuan lento es
	//al ser distintas tablas no puedo hacer un unico indice con las dos columnas
	Pregunta.findAll({
		where:{
			[Sequelize.or]:[
				['MATCH(titulo) against(?)',req.body.cuerpo],
				['MATCH(cuerpo) against(?)',req.body.cuerpo]
			]
		},
		order:[
			[Post,'fecha_alta','DESC']
		]
		,limit:PAGINACION.resultadosPorPagina
		,offset:(+req.pagina)*PAGINACION.resultadosPorPagina,
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
	Pregunta.findAll({
		where:{
			ID:req.body.ID,	
		}
		, raw:true, nest:true,
		plain:true,
		include:Post
	}).then(pregunta=>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada");
			return;
		}else{
			if(pregunta.post.getDataValue('duenioPost')!=req.session.usuario.ID){
				res.status(401).send("Usuario no tiene sesión válida activa.");
				return;
			}else{
				let apropiado = moderar(req.body.cuerpo).apropiado;
				if(apropiado < rechazaPost){
					res.status(400).send("Texto rechazo por moderación automática");
					return;
				}else if(apropiado<reportaPost){
					//Crear reporte
					//TODO Feature: definir tipo y definir si ponemos como reportanteID algo que represente al sistema o se encarga el front (Santiago: Yo digo dejarlo NULL y que se encargue el frontend.)
					ReportePost.create({
						reportadoID: pregunta.ID
					});
				}
				//si pasa el filtro
				pregunta.setDataValue('cuerpo', req.body.cuerpo)
				res.status(200).send("Pregunta actualizada exitosamente");
			}
		}
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
})

router.patch('/respuesta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.")
	}
	Respuesta.findAll({
		where:{
			ID:req.body.ID,	
		}
		, raw:true, nest:true,
		plain:true,
		include:Post
	}).then(respuesta=>{
		if(!respuesta){
			res.status(404).send("Respuesta no encontrada");
			return;
		}else{
			if(respuesta.post.getDataValue('duenioPost')!=req.session.usuario.ID){
				res.status(401).send("Usuario no tiene sesión válida activa.");
				return;
			}else{
				//filtro IA
				let apropiado = moderar(req.body.cuerpo).apropiado;
				if(apropiado < rechazaPost){
					res.status(400).send("Texto rechazo por moderación automática");
					return;
				}else if(apropiado<reportaPost){
					//Crear reporte
					//TODO definir tipo y definir si ponemos como reportanteID algo que represente al sistema o se encarga el front
					ReportePost.create({
						reportadoID: respuesta.ID
					});
				}
				//pasa el filtro
				respuesta.setDataValue('cuerpo', req.body.cuerpo)
				res.status(200).send("Respuesta actualizada exitosamente");
			}
		}
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
})

//Suscripción / desuscripción a pregunta

router.post('/pregunta/:preguntaID/suscripcion', function(req,res){
	//Si no existe suscribe, si existe(sin fecha de baja) desuscribe
	//TODO Feature: acomodar el filtro para que no encuentre suscripciones dadas de baja
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let preguntaID=req.params.preguntaID;

	Pregunta.findAll({
		where:{
			ID: preguntaID
		},
		raw:true, nest:true,
		plain:true
	}).then(pregunta =>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada / disponible");
			return;
		}else{
			// TODO Refactor: Esto no hace falta, se puede hacer pregunta.SuscripcionesPregunta o algo así
			SuscripcionesPregunta.findAll({
				where:{
					preguntaSuscripta: preguntaID,
					suscriptoAPregunta: req.session.usuario.ID,
					fecha_baja:{
						[Op.is]:null
					}
				},
				raw:true, nest:true,
				plain:true
			}).then(sus=>{
				if(!sus){
					SuscripcionesPregunta.create({
						suscriptoAPregunta: req.session.usuario.ID,
						preguntaSuscripta: preguntaID
					});
					res.status(201).send("Suscripción creada");
					return;
				}else{
					// TODO Feature: delete('/pregunta/:preguntaID/suscripcion'); quizá con el DNI al final
					sus.fecha_baja= new Date().toISOString().split('T')[0];
					res.status(204).send("Suscripción cancelada");
				}
			})
			.catch(err=>{
				res.status(500).send(err);
			})  
		}
	})
	.catch(err=>{
        res.status(500).send(err);
    })  
})

//pregunta

router.post('/pregunta', function(req,res){
	// TODO Feaure: etiquetas, y crear las notificaciones correspondientes.
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let apropiado = moderar(req.body.cuerpo).apropiado;
	if(apropiado < rechazaPost){
		res.status(400).send("Texto rechazo por moderación automática");
		return;
	}

	Post.create({
		cuerpo: req.body.cuerpo,
		duenioPostID: req.session.usuario.ID
	}).then(post=>{
		Pregunta.create({
			ID: post.ID,
			titulo: req.body.titulo
		}).then(()=>{
			if(apropiado < reportaPost){
				ReportePost.create({
					reportadoID: post.ID})
			}
			res.status(201).send(post.ID);
		})
		.catch(err=>{
			res.status(500).send(err);
		})
	})
	.catch(err=>{
		res.status(500).send(err);
	})
})


//sugerir preguntas, una re chanchada
// TODO Refactor: Unificar con get('/pregunta')
router.get('/sugerir_pregunta', function(req,res){
	// * https://database.guide/how-the-match-function-works-in-mysql/
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	// TODO Feature: No moderar acá, moderar después de "terminar" el post y "enviar" a publicar. En vez de publicarse de una, se modera, y si sale negativo, se devuelve una negativa.
	let apropiado = moderar(req.body.cuerpo).apropiado;
	if(apropiado < rechazaPost){
		res.status(400).send("Texto rechazo por moderación automática");
		return;
	}
	// TODO Feature: ordenar por relevancia
	//Rara la busqueda, busca el mejor match de titulo con titulo, de titulo con cuerpo, de cuerpo con titulo y de cuerpo con cuerpo
	// ver si anda lo de match
	//hice union atada con alambre, ver cuan lento es
	//al ser distintas tablas no puedo hacer un unico indice con las dos columnas
	/* Promise.all([ */
		Pregunta.findAll({
			// Acá propongo 2 opciones: match trayendo titulo y cuerpo, o match with query expansion solo con titulo
			where:['MATCH(titulo,cuerpo) against(?)',req.body.titulo+' '+req.body.cuerpo],
			order:[
				[Post,'fecha_alta','DESC']
			]
			,limit:1,
			include:Post
		})/* ,
		Pregunta.findAll({
			where:['MATCH(cuerpo) against(?)',req.body.titulo],
			order:[
				[Post,'fecha_alta','DESC']
			]
			,limit:1,
			include:Post
		}),
		Pregunta.findAll({
			where:['MATCH(cuerpo) against(?)',req.body.cuerpo],
			order:[
				[Post,'fecha_alta','DESC']
			]
			,limit:1,
			include:Post
		}),
		Pregunta.findAll({
			where:['MATCH(titulo) against(?)',req.body.cuerpo],
			order:[
				[Post,'fecha_alta','DESC']
			]
			,limit:1,
			include:Post
		}) 
		])*/
			.then(preguntas=>{
				res.status(200).send(preguntas);
			})


})

//respuesta

router.post('/respuesta', function(req,res){
	// TODO Feature: crear las notificaciones correspondientes.

	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let apropiado = moderar(req.body.cuerpo).apropiado;
	if(apropiado < rechazaPost){
		// TODO Feature: ¿Devolver razón? Si se decidió que no, está bien.
		res.status(400).send("Texto rechazo por moderación automática");
		return;
	}

	// TODO Refactor: Quizá sea más facil usar yield para esta parte, o ir devolviendo las premisas. O ambas cosas.
	Pregunta.findAll({
		where:{ID:req.body.IDPregunta},
		raw:true, nest:true,
		plain:true
	}).then(pregunta=>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada / disponible")
		}else{
			Post.create({
				cuerpo: req.body.cuerpo,
				duenioPostID: req.session.usuario.ID
			}).then(post=>{
				Respuesta.create({
					ID: post.ID,
					titulo: req.body.titulo,
					preguntaID: req.body.IDPregunta
				}).then(()=>{
					if(apropiado < reportaPost){
						ReportePost.create({
							reportadoID: post.ID})
					}
					res.status(201).send(post.ID);
				})
				.catch(err=>{
					res.status(500).send(err);
				})
			})
			.catch(err=>{
				res.status(500).send(err);
			})
		}
	})
	.catch(err=>{
		res.status(500).send(err);
	})
})

// valoracion

const valorarPost=function(req,res) {
	//res tendría idpregunta 
	//la valoracion(true es positiva, false negativa y null nada(tipo si la quiere sacar)) 
	//el usuario viene con la sesión

	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.");
		return;
	}

	// TODO Refactor: buscar por PK, ver si es posible traer solo un si existe
	let votadoID=req.params.votadoID;
	Post.findAll({where:{ID:votadoID}
		, raw:true, nest:true,
		plain:true
	}).then(post=>{
			if(!post){
				res.status(404).send("Post no encontrado / disponible.");
				return;
			}else{
				Voto.findAll({where:{
					votadoID,
					votanteID:req.session.usuario.ID
					},
					raw:true,
					nest:true,
					plain:true
				}).then(voto=>{
					if(!voto){
						// si no exite el voto lo crea con lo que mandó
						Voto.create({
							valoracion: req.body.voto,
							votadoID,
							votanteID:req.session.usuario.ID
						});
					}else{
						// TODO Feature: router.delete('/pregunta/:votadoID/valoracion')
						// si existe y es null es que lo quiere sacar
						// TODO Refactor: .body.valoracion vs .body.voto ?
						if(req.body.valoracion==null){
							voto.destroy();
						}else{
							//si no es null lo cambia por el otro
							voto.setDataValue('valoracion', req.body.voto);
						}
					}
					res.status(201).send("Reporte registrado.")
				})
			}
	})
	.catch(err=>{
		res.status(500).send(err);
	})  
};

router.post('/pregunta/:votadoID/valoracion', valorarPost)
router.post('/respuesta/:votadoID/valoracion', valorarPost)


//reporte post

const reportarPost=function(req, res){
	// TODO Refactor: ocupar la sesión activa válida en el server.js así no hay que repetirlo a cada rato
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let reportadoID=req.params.reportadoID;

	Pregunta.findAll({
		where:{
			ID:reportadoID,	
		}
		, raw:true, nest:true,
		plain:true
	}).then(pregunta=>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada");
			return;
		}else{
			// TODO Feature: ver si ya se reportó, y prohibir
			ReportePost.create({
				tipo: req.body.tipo,
				reportante: req.session.usuario.ID,
				reportado: reportadoID
			});
			res.status(201).send("Reporte registrado")
		}
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
};

router.post('/pregunta/:reportadoID/reporte', reportarPost);
router.post('/respuesta/:reportadoID/reporte', reportarPost);

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
	//Si no existe suscribe, si existe(sin fecha de baja) desuscribe
	//TODO Feature: acomodar el filtro para que no encuentre suscripciones dadas de baja
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}

	let etiquetaID=req.params.etiquetaID;

	Etiqueta.findAllAll({
		where:{
			ID: etiquetaID
		},
		raw:true, nest:true,
		plain:true
	}).then(etiqueta =>{
		if(!etiqueta){
			res.status(404).send("Etiqueta no encontrada / disponible");
			return;
		}else{
			SuscripcionesEtiqueta.findAll({
				where:{
					etiquetaSuscripta: etiquetaID,
					suscriptoAEtiqueta: req.session.usuario.ID,
					fecha_baja:{
						[Op.is]:null
					}
				},
				raw:true, nest:true,
				plain:true
			}).then(sus=>{
				if(!sus){
					SuscripcionesEtiqueta.create({
						suscriptoAEtiqueta: req.session.usuario.ID,
						etiquetaSuscripta: etiquetaID
					});
					res.status(201).send("Suscripción creada");
					return;
				}else{
					// TODO Feature: router.delete
					sus.fecha_baja= new Date().toISOString().split('T')[0];
					res.status(204).send("Suscripción cancelada");
				}
			})
			.catch(err=>{
				res.status(500).send(err);
			})  
		}
	})
	.catch(err=>{
        res.status(500).send(err);
    })  
})


//notificaciones

router.get('/notificaciones', function(req,res){
	Notification.findAll({
		order:[
			['visto','ASC'],
			['createdAt', 'DESC']
		]
		,limit:PAGINACION.resultadosPorPagina
		,offset:(+req.pagina)*PAGINACION.resultadosPorPagina,
		raw:true,
		nest:true
	}).then(notificaciones=>{
		res.status(200).send(notificaciones);
	}).catch(err=>{
		res.status(500).send(err);
	})
})

/* router.get('/',(req,res)=>{
	// retornar estado de la api, disponible o no
}) */

export {router};