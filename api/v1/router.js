import * as express from "express";
import * as bcrypt from "bcrypt";
const router = express.Router();
import {Usuario,Pregunta} from '../api/v1/model.js';
import { ReportePost, SuscripcionesPregunta, Voto } from "./model.js";
import { Sequelize } from "sequelize";
import {moderar} from "../api/v1/ia.js";

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

const registro_creacion = function(req,res){
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

router.post('/registro', registro_creacion(req,res));

//creación usuario

router.post('/creacion_usuario', registro_creacion(req,res));

// recuperación de contraseña

router.post('/recuperar_contrasenia',function(req,res){

    function generarContrasenia() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }

    Usuario.findAll({
		where:{DNI:req.body.DNI}
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

        //TODO mandar mail
        res.status(200).send('DNI encontrado, correo enviado')
    })
});

//Recibir preguntas recientes / relevantes
router.get('/preguntas',(req,res)=>{
	// ver si anda lo de match
	//hice union atada con alambre, ver cuan lento es
	//al ser distintas tablas no puedo hacer un unico indice con las dos columnas
	Promise.all([
	Pregunta.findAll({
		where:['MATCH(cuerpo) against(?)',req.body.cuerpo],
		order:[
			[Post,'fecha_alta','DESC']
		]
		,limit:PAGINACION.resultadosPorPagina
		,offset:(+req.pagina)*PAGINACION.resultadosPorPagina,
		include:Post
	}),
	Pregunta.findAll({
		where:['MATCH(titulo) against(?)',req.body.cuerpo],
		order:[
			[Post,'fecha_alta','DESC']
		]
		,limit:PAGINACION.resultadosPorPagina
		,offset:(+req.pagina)*PAGINACION.resultadosPorPagina,
		include:Post
	})
	])
		.then(preguntas=>{
			res.status(200).send(preguntas);
		})
})

// valoracion

router.post('/valorar', function(req,res) {
	//res tendría idpregunta 
	//la valoracion(true es positiva, false negativa y null nada(tipo si la quiere sacar)) 
	//el usuario viene con la sesión
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.");
		return;
	}
	Post.findAll({where:{ID:req.body.votadoID}
		, raw:true, nest:true,
		plain:true
	}).then(post=>{
			if(!post){
				res.status(404).send("Post no encontrado / disponible.");
				return;
			}else{
				Voto.findAll({where:{
					votadoID:pregunta.ID,
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
							votadoID: pregunta.ID,
							votanteID:req.session.usuario.ID
						});
					}else{
						// si existe y es null es que lo quiere sacar
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
})


//reporte post

router.post('reporte_post', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Pregunta.findAll({
		where:{
			ID:req.body.ID,	
		}
		, raw:true, nest:true,
		plain:true
	}).then(pregunta=>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada");
			return;
		}else{
			ReportePost.create({
				tipo: req.body.tipo,
				reportante: req.session.usuario.ID,
				reportado: req.body.IDPregunta
			});
			res.status(201).send("Reporte registrado")
		}
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
})

//Edición de pregunta

router.patch('/editar_pregunta', function(req,res){
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
					//TODO definir tipo y definir si ponemos como reportanteID algo que represente al sistema o se encarga el front
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

//editar respuesta

router.patch('/editar_respuesta', function(req,res){
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

// reporte usuario

router.post('reporte_usuario', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Usuario.findAll({
		where:{
			ID:req.body.IDUsuario,	
		}
		, raw:true, nest:true,
		plain:true
	}).then(usuario=>{
		if(!usuario){
			res.status(404).send("Usuario no encontrado");
			return;
		}else{
			ReportesUsuario.create({
				reportante: req.session.usuario.ID,
				reportado: req.body.IDUsuario
			});
			res.status(201).send("Reporte registrado")
		}
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
})

//administración de perfil

router.patch('/administracion_perfil', function(req, res){
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
		//TODO definir que mas puede cambiar y que constituye datos inválidos
		usuario.contrasenia=req.body.contrasenia;
		res.status(200).send("Datos actualizados exitosamente");
	})
    .catch(err=>{
        res.status(500).send(err);
    })  
})

//Suscripción / desuscripción a pregunta

router.post('/suscripcion_pregunta', function(req,res){
	//Si no existe suscribe, si existe(sin fecha de baja) desuscribe
	//TODO acomodar el filtro para que no encuentre suscripciones dadas de baja
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Pregunta.findAll({
		where:{
			ID: req.body.IDPregunta
		},
		raw:true, nest:true,
		plain:true
	}).then(pregunta =>{
		if(!pregunta){
			res.status(404).send("Pregunta no encontrada / disponible");
			return;
		}else{
			SuscripcionesPregunta.findAll({
				where:{
					preguntaSuscripta: req.body.IDPregunta,
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
						preguntaSuscripta: req.body.IDPregunta
					});
					res.status(201).send("Suscripción creada");
					return;
				}else{
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


//Suscripción / desuscripción a etiqueta

router.post('/suscripcion_etiqueta', function(req,res){
	//Si no existe suscribe, si existe(sin fecha de baja) desuscribe
	//TODO acomodar el filtro para que no encuentre suscripciones dadas de baja
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Etiqueta.findAllAll({
		where:{
			ID: req.body.IDEtiqueta
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
					etiquetaSuscripta: req.body.IDEtiqueta,
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
						etiquetaSuscripta: req.body.IDEtiqueta
					});
					res.status(201).send("Suscripción creada");
					return;
				}else{
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


//busqueda usuarios

router.get('/busqueda_usuarios', function(req,res){
	//TODO permisos
	//Busca con nombre like? andará eso?
	if(!req.session.usuario){
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}
	Usuario.findAll({
		where:{
			nombre:{[Sequelize.OP.like]: '%${req.body.nombre}%'}
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

//pregunta

router.post('/pregunta', function(req,res){
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
router.get('/sugerir_pregunta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	let apropiado = moderar(req.body.cuerpo).apropiado;
	if(apropiado < rechazaPost){
		res.status(400).send("Texto rechazo por moderación automática");
		return;
	}
	//Rara la busqueda, busca el mejor match de titulo con titulo, de titulo con cuerpo, de cuerpo con titulo y de cuerpo con cuerpo
	// ver si anda lo de match
	//hice union atada con alambre, ver cuan lento es
	//al ser distintas tablas no puedo hacer un unico indice con las dos columnas
	Promise.all([
		Pregunta.findAll({
			where:['MATCH(titulo) against(?)',req.body.titulo],
			order:[
				[Post,'fecha_alta','DESC']
			]
			,limit:1,
			include:Post
		}),
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
		])
			.then(preguntas=>{
				res.status(200).send(preguntas);
			})


})

//respuesta

router.post('/respuesta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	let apropiado = moderar(req.body.cuerpo).apropiado;
	if(apropiado < rechazaPost){
		res.status(400).send("Texto rechazo por moderación automática");
		return;
	}
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
				//que hacemos aca?
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

//get_etiquetas

router.get('/get_etiquetas', function(req,res){
	//sin paginación porque no deberían ser tantas
	Etiqueta.findAll({
		raw:true,
		nest:true
	}).then(etiquetas=>{
		res.status(200).send(etiquetas);
	}).catch(err=>{
		res.status(500).send(err);
	})
})


//get_notificaciones

router.get('/get_notificaciones', function(req,res){
	//ver si está bien el orden
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
}) */

export {router};