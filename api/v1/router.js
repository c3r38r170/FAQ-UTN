import * as express from "express";
import * as bcrypt from "bcrypt";
const router = express.Router();
import {Usuario,Pregunta} from '../api/v1/model.js';
import { ReportePost, SuscripcionesPregunta, Voto } from "./model.js";
import { Sequelize } from "sequelize";

// TODO Refactor: ¿Sacar y poner en models.js? Así el modelo se encarga de la paginación, y a los controladores no les importa.
const PAGINACION={
	resultadosPorPagina:10
}

// sesiones

router.post('/sesion', function(req, res) {
	let usuario;

	Usuario.find({
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

const registro_creacion = function(req,res){
	Usuario.find({
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

    Usuario.find({
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

//Recibir preguntas recientes / revantes
router.get('/preguntas',(req,res)=>{
	// TODO Feature: Aceptar etiquetas y filtro de texto
	Pregunta.pagina(+req.pagina)
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
	Post.find({where:{ID:req.body.votadoID}
		, raw:true, nest:true,
		plain:true
	}).then(post=>{
			if(!post){
				res.status(404).send("Post no encontrado / disponible.");
				return;
			}else{
				Voto.find({where:{
					votadoID:pregunta.ID,
					votanteID:req.session.usuario.ID
				}}).then(voto=>{
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
	Pregunta.find({
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

router.post('/editar_pregunta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.")
	}
	Pregunta.find({
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
				//TODO mandar al gpt

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

router.post('/editar_respuesta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa.")
	}
	Respuesta.find({
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
				//TODO mandar al gpt

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

// reporte usuario

router.post('reporte_usuario', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Usuario.find({
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

router.post('/administracion_perfil', function(req, res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Usuario.find({
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
	Pregunta.find({
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
			SuscripcionesPregunta.find({
				where:{
					preguntaSuscripta: req.body.IDPregunta,
					suscriptoAPregunta: req.session.usuario.ID
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

router.post('/suscripcion_pregunta', function(req,res){
	//Si no existe suscribe, si existe(sin fecha de baja) desuscribe
	//TODO acomodar el filtro para que no encuentre suscripciones dadas de baja
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	Etiqueta.find({
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
			SuscripcionesEtiqueta.find({
				where:{
					etiquetaSuscripta: req.body.IDEtiqueta,
					suscriptoAEtiqueta: req.session.usuario.ID
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
	//TODO filtrar por el gpt
	Post.create({
		cuerpo: req.body.cuerpo,
		duenioPostID: req.session.usuario.ID
	}).then(post=>{
		Pregunta.create({
			ID: post.ID,
			titulo: req.body.titulo
		}).then(
			res.status(201).send(post.ID)
		)
		.catch(err=>{
			res.status(500).send(err);
		})
	})
	.catch(err=>{
		res.status(500).send(err);
	})
})

//respuesta

router.post('/respuesta', function(req,res){
	if(!req.session.usuario){
		res.status(401).send("Usuario no tiene sesión válida activa");
		return;
	}
	//TODO filtrar por el gpt
	Pregunta.find({
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
				}).then(
					res.status(201).send("Respuesta registrada")
				)
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

router.post('moderacion_preguntas', function(req,res){
	if(!req.session.usuario){
		//Falta lo de permisos
		res.status(403).send("No se poseen permisos de moderación o sesión válida activa");
		return;
	}
	Post.find({
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
				ReportePost.find({
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
	Notification.findAll({
		order:[
			['visto','DESC']
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