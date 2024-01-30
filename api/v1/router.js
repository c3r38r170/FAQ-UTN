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
			console.log(coinciden);
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
	// TODO Feature: Considerar el hecho de enviar la cantidad de respuestas y no las respuestas en sí. Quizá con una bandera.

	// TODO Feature: Actualizar Pregunta.pagina así lo puede usar el frontend.
	// Pregunta.pagina(+req.pagina)

	// TODO Refactor: Ir considerando qué filtros poner. Va a haber consultas sin busqueda, por ejemplo.
	/* 
		1) Inicio: Pregunta y primera respuesta, ordenada por más recientes
		2) Búsqueda: Pregunta y primera respuesta, filtrado por texto y etiquetas, ordenada por coincidencia
		3) Perfil: Preguntas y primera respuesta, filtradas por usuario, ordenada por más recientes
		4) Sugerencias: Solo título e ID, filtrado por texto de título y cuerpo, ordenada por coincidencia
		5) Suscripciones: Solo título e ID (y respuesta?? la última o la cantidad... o el mensaje... o quizá se solucione en el frontend, no se.), filtrado por suscripcion (sesión), ordenada por más recientes

		Los reportes se conseguirán de /pregunta/reporte y otro endpoint, este no.

		El formato largo incluye:
		- Pregunta
			- fecha
			- ID
		- Cuerpo
		- 1ra respuesta
			- Dueño??
				- nombre
				- ID
				- rol
			- fecha
			- Valoración
			- cuerpo
		- Valoración
		- Dueño
			- nombre
			- ID
			- rol
		El formato corto:
		- Pregunta / título
		- ID

		Parámetros para lograr esto:
		{
			filtro:null (puede ser texto (busqueda o titulo+cuerpo por sugerencia), vacío, o un objeto con texto y etiquetas; si está definido, se ordena por coincidencia)

			formatoCorto:false (booleano. Todos los datos o solo pregunta/título e ID)

			duenioID:null (duenioID, )

			pagina: Paginación, paralelo a cualquier conjunto de las superiores
		}
		 filtro  |     sí     |      no
		f. largo |  búsqueda  | inicio/perfil
		f. corto | sugerencia |  suscripcion

		if(req.body.duenioID){
			// 3) Perfil
		}else if(req.body.filtros){
			if(req.body.formatoCorto){
				// 4) Sugerencias
			}else{
				// 2) Búsqueda
			}
		}else if(req.body.formatoCorto){
			// 5) Suscripciones
		}else{
			// 1) Inicio
		}

		if(req.body.duenioID){
			// devolver en formato largo y sin filtros, según el dueño
		}else{
			if(req.body.filtros){
				// Ver si el filtro es solo texto o etiquetas también
				// Agregar filtro de match al where, y de etiquetas.
			}
			if(req.body.formatoCorto){
				// Agregar raw, y eso para que sean pocos datos. No hace falta cruzar con casi nada.
				// Otra opción es manipular lo que se obtiene para mandar objetos reducidos.
			}

			if(req.body.filtros && !req.body.formatoCorto){
				// Búsqueda: Agregar relevancia por votaciones y respuestas... Desarrollar algoritmo de puntaje teniendo en cuenta todo.
			}

			// Devolver lo que se obtuvo, como objeto...
		}
	*/
	
	if(req.body.duenioID){
		Pregunta.findAll({
			include:[
				{
					model:Post
					,include:[
						{
							model:Voto
							// ,as:'votado'
							,include:{model:Usuario,as:'votante'}
						}
						,{
							model:Usuario
							,as:'duenio'
							,include:{
								model:Perfil
								,attributes:['ID','nombre']
							}
							,attributes:['DNI','nombre']
						}
					]
				},
				{
					model:Respuesta
					,as:'respuestas'
					,include:/* [ */
						Post
						
					/* ] */
					
					// ,
					/* {
						model:Post
						,include:[
							 */
							/* {
								model:Voto
								// ,as:'votado'
								,include:{model:Usuario,as:'votante'}
								// TODO Feature: Intentar agrupar votos, y ofrecer una medida resumen para ordenar. Quitar el resto afuera (antes intentar limit)
							}
							,{
								model:Usuario,
								as:'duenio'
							} */
						/* ]
					} */
					,attributes:{
						include:[
							[
								Sequelize.literal(`(SELECT SUM(IF(valoracion=1,1,-1)) FROM votos AS v WHERE v.votadoID = post.ID)`),
								'puntuacion'
							]
						]
					}
					/* ,order: [
							[Sequelize.literal('puntuacion'), 'DESC']
							// ,['fecha', 'DESC']
					] */
					// ,limit:1
					/* ,attributes:[
						'ID'
						// ,Sequelize.fn('sum',Sequelize.col('post.votos.valoracion'))
						// ,Sequelize.literal
						,'post.ID'
						,'post.cuerpo'
					] */
					/* ,attributes:[
						'ID'
						,'post.cuerpo'
						,[
							Sequelize.fn('sum',Sequelize.col('post.voto.valoracion'))
							,'valoracionTotal'
						]
					]
					,order:[
						['valoracionTotal','DESC']
					]
					,limit:1 */
				}
			],
			/* attributes:[
				'ID'
				,'titulo'
				,'fecha'
				,'cuerpo'
				,'post.duenio.DNI'
			], */
			/* attributes:{
				include:[
					[
						Sequelize.literal(`(SELECT SUM(IF(valoracion=1,1,-1)) as respuestas, v.votadoID FROM votos AS v WHERE v.votadoID = respuestas.post.ID)`),
						'respuestas.puntuacion'
					]
				]
			}, */
			where:{
				'$post.duenio.DNI$':+req.body.duenioID
			}
			// ,raw:true,nest:true
		})
			.then(preguntas=>{
				res.status(200).send(preguntas)
			})
			.catch(err=>{
				console.log(err)
			});
	}else{
		let opciones={include:[Post]};

		if(req.body.filtrar){
			let filtrar=req.body.filtrar;

			if(filtrar.texto){
				opciones.where=Sequelize.or(
					Sequelize.literal('match(post.cuerpo) against ("'+filtrar.texto+'")'),
					Sequelize.literal('match(titulo) against ("'+filtrar.texto+'")')	
				);
			}
			
			if(filtrar.etiquetas){
				opciones.include.push({
					model: Etiqueta,
					required: true,
					where: {
						ID:filtrar.etiquetas
					}
				});
			}
		}

		/* El formato largo incluye:
		- Pregunta ✅
			- fecha ✅
			- ID ✅
		- Cuerpo ✅
		- 1ra respuesta
			- Dueño??
				- nombre
				- ID
				- rol
			- fecha ✅
			- Valoración
			- cuerpo ✅
		- Valoración ✅
		- Dueño ✅
			- nombre ✅
			- ID ✅
			- rol ✅
		El formato corto: ✅
		- Pregunta / título ✅
		- ID  ✅*/
		if(req.body.formatoCorto){
			// Agregar raw, y eso para que sean pocos datos. No hace falta cruzar con casi nada.
			// Otra opción es manipular lo que se obtiene para mandar objetos reducidos.
			opciones.attributes=['ID','titulo'];
		}else{
			// * Datos propios
			opciones.include[0]={
				model:Post
				,include:[
					{
						model:Voto
						,include:{model:Usuario,as:'votante'}
					}
					,{
						model:Usuario
						,as:'duenio'
						,include:{
							model:Perfil
							,attributes:['ID','nombre']
						}
						,attributes:['DNI','nombre']
					}
				]
			};
			// * Respuesta más interesante
			opciones.include.push(
				// TODO Feature: Ordenar respuesta y tener una sola. Resolver primero en el caso de preguntas por usuario y después traer acá (es más cómodo trabajar allá)
				{
					model:Respuesta
					,as:'respuestas'
					,include:Post
				}
			);
		}

		if(req.body.filtrar && !req.body.formatoCorto){
			// Búsqueda: Agregar relevancia por votaciones y respuestas... Desarrollar algoritmo de puntaje teniendo en cuenta todo.
			// opciones.attributes={include:[Sequelize.literal('(SELECT COUNT(r.*)*2 FROM respuestas ON )'),'puntuacion']}
		}else{
			opciones.order=[[Post,'fecha','DESC']];
		}

		Pregunta.findAll(opciones)
			.then(preguntas=>{
				res.status(200).send(preguntas)
			})
			.catch(err=>{
				console.log(err)
			});
	}
	return;

	// TODO Feature: ver si anda lo de match, y lo del or  quizá haya que poner tabla.columna en vez de solo las columnas
	//hice union atada con alambre, ver cuan lento es
	//al ser distintas tablas no puedo hacer un unico indice con las dos columnas
	Pregunta.findAll({
		where:	Sequelize.or(
				Sequelize.literal('match(cuerpo) against ("'+req.body.filtro+'")'),
				Sequelize.literal('match(titulo) against ("'+req.body.filtro+'")')	
				)
		,
		order:[
			[Post,'fecha','DESC']
		]
		,limit:PAGINACION.resultadosPorPagina,
		offset:(+req.body.pagina)*PAGINACION.resultadosPorPagina,
		include:Post
	})
		.then(preguntas=>{
			res.status(200).send(preguntas);
		})
})

router.patch('/pregunta', function(req,res){
	// TODO Feature: editar etiquetas.
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

//Suscripción / desuscripción a pregunta

router.post('/pregunta/:preguntaID/suscripcion', function(req,res){
	//Si no existe suscribe, si existe(sin fecha de baja) desuscribe
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
					// TODO Feature: delete('/pregunta/:preguntaID/suscripcion'); quizá con el DNI al final
					sus.fecha_baja= new Date().toISOString().split('T')[0];
					sus.save();
					//devuelve el 204 pero no el mensaje
					res.status(204).send("Suscripción cancelada");
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

//pregunta

router.post('/pregunta', function(req,res){
	// TODO Feaure: etiquetas, y crear las notificaciones correspondientes.
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
			}).then(()=>{
				if(respuesta.apropiado < reportaPost){
					//testeado atado con alambre anda, habria que buscar un mensaje que caiga en esta
					ReportePost.create({
						reportadoID: post.ID})
				}
				//Sin las comillas se piensa que pusimos el status dentro del send
				res.status(201).send(post.ID+"");
			})
			.catch(err=>{
				res.status(500).send(err);
			})
		})
	})
	.catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
})

//respuesta

router.post('/respuesta', function(req,res){
	// TODO Feature: crear las notificaciones correspondientes.
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
		Pregunta.findByPk(req.body.IDPregunta,{include:Post})
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


router.post('/pregunta/:votadoID/valoracion', valorarPost)
router.post('/respuesta/:votadoID/valoracion', valorarPost)

router.delete('/pregunta/:votadoID/valoracion', eliminarVoto)
router.delete('/respuesta/:votadoID/valoracion', eliminarVoto)

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
					// TODO Feature: router.delete
					sus.fecha_baja= new Date().toISOString().split('T')[0];
					sus.save();
					//manda el 204 pero no el mensaje
					res.status(204).send("Suscripción cancelada");
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

router.get('/notificaciones', function(req,res){
	Notificacion.findAll({
		order:[
			['visto','ASC'],
			['createdAt', 'DESC']
		]
		,limit:PAGINACION.resultadosPorPagina
		,offset:(+req.body.pagina)*PAGINACION.resultadosPorPagina,
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