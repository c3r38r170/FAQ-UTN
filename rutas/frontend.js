import * as express from "express";
const router = express.Router();
import { Pagina, Busqueda } from "../frontend/componentes.js";
import { Pregunta } from "../frontend/static/componentes/pregunta.js";
import { Pregunta as PreguntaDAO, Usuario as UsuarioDAO, Post, Usuario, Respuesta } from '../api/v1/model.js';
import { ChipUsuario } from "../frontend/static/componentes/chipusuario.js";
import { Busqueda as BusquedaDAO } from "../frontend/static/componentes/busqueda.js"
// TODO Feature: ¿Configuración del DAO para ser siempre plain o no?  No funcionaría con las llamadas crudas que hacemos acá. ¿Habrá alguna forma de hacer que Sequelize lo haga?
// PreguntaDAO.siemprePlain=true; // Y usarlo a discresión.

/*
router.get("/", (req, res) => {
	PreguntaDAO.pagina()
		.then(pre=>{
	
			let pagina = new Pagina({
				ruta: req.path,
				titulo: "Inicio",
				sesion: req.session.usuario,
			});
			pagina.partes.push(
				new Busqueda('Hola')
				,...pre.map(p=>new Pregunta(p))
				// TODO Feature: , control de paginación
			)
			res.send(pagina.render());
		})
		// TODO Feature: Catch (¿generic Catch? "res.status(500).send(e.message)" o algo así))
});
*/

//Ruta que muestra todas las preguntas y respuestas
// Falta implementar la paginación

router.get("/", async (req, res) =>  {
    try {
        const preguntas = await PreguntaDAO.findAll({
            include: [
                {
                    model: Post,
                    as: 'post'
                },
                {
                    model: Respuesta,
                    as: 'respuestas',
                    include: [
                        {
                            model: Post,
                            as: 'post'
                        }
                    ]
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


		for(let i=0; i < preguntas.length;i++){
			pagina.partes.push(new Pregunta(preguntas[i].dataValues))
		}

        res.send(pagina.render());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});



router.get("/perfil/:id?", (req, res) => {
	// TODO Feature: Ordenar posts por fecha
	/* TODO Feature: si no hay ID, es el propio; si hay ID, solo lectura y posts */
	let id=req.params.id;
	let logueadoId=req.session.usuario.ID;
	let titulo="Perfil de ";
	let usu;

	if(id && (!logueadoId || id != logueadoId)){
		usu= UsuarioDAO.findById(id,{
			include:{
				// TODO Feature: Ver si no choca explota. Y si .posts choca con los eliminados
				all:true
				,nested:true
			}
		});
	}else{
		usu=req.session.usuario;
	}

		// TODO Feature: Componente "Tarjeta de Usuario", o hacer una versión del Chip de Usuario con esteroides? Ya no sería chip... Pero llevan básicamente la misma info
		/* tarjeta de usuario 
		actividad*/
  let pagina = new Pagina({
    ruta: req.path,
    titulo: 'Perfil de '+usuario.nombreCompleto,
    sesion: req.session.usuario,
		partes:[
			usuario.posts.map(p=>{
				return p.pregunta?
					new Pregunta(p.pregunta)
					:new Respuesta(p.respuesta)
			})
		]
  });
  res.send(pagina.render());
});

// Ruta que muestra 1 pregunta con sus respuestas
router.get("/pregunta/:id?", async (req, res) =>  {
    try {
        const p = await PreguntaDAO.findByPk(req.params.id, {
            raw: true,
            plain: true,
            nest: true,
            include: [
                {
                    model: Post,
                    as: 'post'
                },
                {
                    model: Respuesta,
                    as: 'respuestas',
                    include: [
                        {
                            model: Post,
                            as: 'post'
                        }
                    ]
                }
            ]
        });

        if (!p) {
            res.status(404).send('ID de pregunta inválida');
            return;
        }

        let pagina = new Pagina({
            ruta: req.path,
            titulo: p.titulo,
            sesion: req.session.usuario
        });

        pagina.partes.push(
            // TODO Feature: Diferenciar de la implementación en / así allá aparece la primera respuesta y acá no.
            new Pregunta(p)
			
            //,...p.respuestas.map(r=>new Respuesta(r))
        );
		console.log('Pregunta PUSHH',p);

        res.send(pagina.render());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});


// Ruta Para Pruebas de Componentes
router.get("/componentes", (req, res) => {
  let pagina = new Pagina({
    ruta: req.path,
    titulo: "Componentes",
    sesion: req.session.usuario,
  });
  pagina.partes.push(new Pregunta({
	titulo: "Este es el titulo",
	cuerpo:
	  "Lorem Ipsum is simply dummy text of the printing and the industrys standard dummy text ever since the 1500s?",
	fecha: "31 de Marzo de 2023",
	post: {
		duenioPostID: 1
	}
  }))
  res.send(pagina.render());
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
	pagina.partes.push(new BusquedaDAO())
	res.send(pagina.render());
  });
  


export { router };