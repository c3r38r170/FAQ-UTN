import * as express from "express";
const router = express.Router();
import { Pagina, Busqueda } from "../frontend/componentes.js";
import { Pregunta } from "../frontend/static/componentes/pregunta.js";
import { Pregunta as PreguntaDAO, SuscripcionesPregunta, Usuario as UsuarioDAO } from '../api/v1/model.js';
// TODO Feature: ¿Configuración del DAO para ser siempre plain o no?  No funcionaría con las llamadas crudas que hacemos acá. ¿Habrá alguna forma de hacer que Sequelize lo haga?
// PreguntaDAO.siemprePlain=true; // Y usarlo a discresión.

router.get("/", (req, res) => {
	Pregunta.pagina()
		.then(pre=>{
			let pagina = new Pagina({
				ruta: req.path,
				titulo: "Inicio",
				sesion: req.session.usuario,
			});
			pagina.partes.push(
				new Busqueda(/* ??? */'Hola')
				,...pre.map(p=>new Pregunta(p))
				// TODO Feature: , control de paginación
			)
			res.send(pagina.render());
		})
		// TODO Feature: Catch (¿generic Catch? "res.status(500).send(e.message)" o algo así))
});

router.get("/suscripciones",(req,res)=>{
	if(!req.session.usuario){
		res.status(401).send();
		return;
	}

	PreguntaDAO.findAll({
		// TODO Refactor: Actualizar cuando se cambie la forma de asociación entre Pregunta y Respuesta 
		include:{
			model:SuscripcionesPregunta
			,where:{
				suscriptoAPregunta:req.session.usuario.ID
			}
		}
	})
		.then((preguntas)=>{
			let partes;
			if(preguntas){
				// TODO Feature: Indicar que acá es con la primera pregunta. Quizá buscar con el DAO con o sin Preguntas y que el componente vea si hay o no para poner la más relevante a la vista; es buena esa.
				partes=preguntas.map(p=>new Pregunta(p));
			}else{
				// TODO UX: Mensaje de que no hay suscripciones. Componente mensaje PFU-130
				partes=[];
			}

			let pagina=new Pagina({
				ruta:req.path
				,titulo:p.titulo
				,sesion:req.session.usuario
			});
			// TODO Feature: Scroll infinito. usar el endpoint de paginacion. Quizá como el de tabla, haya que definir un componente Scroll infinito
			pagina.partes=partes;
			
			res.send(pagina.render());
		})
})

router.get("/perfil/:id?", (req, res) => {
	// TODO Feature: Ordenar posts por fecha
	/* TODO Feature: si no hay ID, es el propio; si hay ID, solo lectura y posts */
	let id=req.params.id;
	let logueadoId=req.session.usuario.ID;
	let titulo="Perfil de ";
	let usu;

	if(id && (!logueadoId || id != logueadoId)){
		// TODO Refactor: ver si yield anda como "sincronizador"
		usu=yield UsuarioDAO.findById(id,{
			include:{
				// TODO Feature: Ver si no choca explota. Y si .posts choca con los eliminados
				all:true
				,nested:true
			}
		});
	}else{
		usu=req.session.usuario;
	}

	// TODO Feature: Obtener los posts paginados por ID del usuario, la sesion no guarda las asociaciones

		// TODO Feature: Componente "Tarjeta de Usuario", o hacer una versión del Chip de Usuario con esteroides? Ya no sería chip... Pero llevan básicamente la misma info
		/* tarjeta de usuario 
		actividad*/
  let pagina = new Pagina({
    ruta: req.path,
    titulo: 'Perfil de '+usuario.nombreCompleto,
    sesion: req.session.usuario,
		partes:[
			// TODO Feature: Implementar scroll infinito
			usuario.posts.map(p=>{
				return p.pregunta?
					new Pregunta(p.pregunta)
					:new Respuesta(p.respuesta)
			})
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
		usu=yield UsuarioDAO.findById(id,{
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

router.get("/pregunta/:id?", (req, res) => {
	PreguntaDAO.findById(req.params.id,{plain: true}) // TODO Refactor: hace falta el plain?? ¿No es raw + nest? 
		.then((p)=>{
			if(!p){
				res.status(404).send('ID de pregunta inválida');
			}

			let pagina=new Pagina({
				ruta:req.path
				,titulo:p.titulo
				,sesion:req.session.usuario
			});
			pagina.partes.push(
				// TODO Feature: Diferenciar de la implementación en / así allá aparece la primera respuesta y acá no.
				new Pregunta(p)
				,...p.respuestas.map(r=>new Respuesta(r))
				// TODO Feature: si está logueado, campo de hacer una respuesta
			);
			res.send(pagina.render());
		})
});

// TODO Refactor: Si esta ruta es para pruebas, dejarlo en un comentario.
router.get("/componentes", (req, res) => {
  let pagina = new Pagina({
    ruta: req.path,
    titulo: "Componentes",
    sesion: req.session.usuario,
  });
  res.send(pagina.render());
});

export { router };