import * as express from "express";
import { Sequelize } from "sequelize";
const router = express.Router();
/*
 */
import {
  Pagina,
  DesplazamientoInfinito,
  Modal,
  Pregunta,
  ChipUsuario,
  Busqueda,
  Respuesta,
  Tabla,
  MensajeInterfaz,
  Titulo,
  Formulario,
  Desplegable
} from "./static/componentes/todos.js";
import {
  Voto as VotoDAO,
  Notificacion as NotificacionDAO,
  EtiquetasPregunta as EtiquetasPreguntaDAO,
  Etiqueta as EtiquetaDAO,
  Pregunta as PreguntaDAO,
  SuscripcionesPregunta as SuscripcionesPreguntaDAO,
  Usuario as UsuarioDAO,
  Respuesta as RespuestaDAO,
  Post as PostDAO,
  ReportesUsuario as ReportesUsuarioDAO,
  Bloqueo as BloqueoDAO,
  Usuario,
  Perfil as PerfilDAO,
  Permiso as PermisoDAO,
  Parametro as ParametroDAO,
  Categoria,
} from "../api/v1/model.js";

// TODO Refactor: Hacer raw o plain todas las consultas que se puedan

// TODO Refactor: Usar todas.js
import { PaginaInicio, PantallaNuevaPregunta, PaginaPregunta, PantallaModeracionUsuarios, PantallaModeracionPosts, PantallaEditarPregunta } from './static/pantallas/todas.js';
import { PaginaPerfil } from "./static/pantallas/perfil.js";
import { PaginaPerfilPropioInfo } from "./static/pantallas/perfil-propio-info.js";
import { PaginaPerfilPropioPreguntas } from "./static/pantallas/perfil-propio-preguntas.js";
import { PaginaPerfilPropioRespuestas } from "./static/pantallas/perfil-propio-respuestas.js";
import { PaginaSuscripciones } from "./static/pantallas/suscripciones.js";
import { PantallaAdministracionParametros } from "./static/pantallas/administracion-parametros.js";
import { SinPermisos } from "./static/pantallas/sin-permisos.js";
import { PantallaAdministracionPerfiles } from "./static/pantallas/administracion-perfiles.js";
import { PantallaAdministracionCategorias } from "./static/pantallas/administracion-categorias.js";
import { PantallaAdministracionEtiquetas } from "./static/pantallas/administracion-etiquetas.js";
import { PantallaEtiquetaPreguntas } from "./static/pantallas/pantalla-etiquetas-pregunta.js";
import { PantallaAdministracionUsuarios } from "./static/pantallas/administracion-usuarios.js";

router.get("/", (req, res) => {
  // ! req.path es ''
  let consultaCategorias = Categoria.findAll({include:{model:EtiquetaDAO, as:'etiquetas'}});
  // console.log(req.query);
  let etiquetas=req.query.etiquetas;
  let texto=req.query.searchInput;
  if (texto || etiquetas) {
    let queryString = req.url.substring(req.url.indexOf("?"));

    let parametrosBusqueda = { filtrar:{}};
    if(texto){
      parametrosBusqueda.filtrar.texto=texto;
    }
    if(etiquetas){
      parametrosBusqueda.filtrar.etiquetas=Array.isArray(etiquetas)?etiquetas:[etiquetas];
    }

    Promise.all([
      // * Acá sí pedimos antes de mandar para que cargué más rápido y se sienta mejor.
      PreguntaDAO.pagina(parametrosBusqueda)
      ,consultaCategorias
    ])
      .then(([preguntas,categorias]) => {
        let pagina = PaginaInicio(req.session, queryString,categorias);
        pagina.partes[2] /* ! DesplazamientoInfinito */.entidadesIniciales = preguntas;

        res.send(pagina.render());
      });
  } else {
    // * Inicio regular.
    Promise.all(
      [
        PreguntaDAO.pagina()
        ,Categoria.findAll({include:{model:EtiquetaDAO, as:'etiquetas'}})
      ]
    )
      .then(([pre,categorias]) => {
        let pagina = PaginaInicio(req.session,'',categorias);
        pagina.partes[2] /* ! DesplazamientoInfinito */.entidadesIniciales = pre;

        res.send(pagina.render());
      });
    // TODO Feature: Catch (¿generic Catch? "res.status(500).send(e.message)" o algo así))
  }
});

// * Ruta que muestra 1 pregunta con sus respuestas
router.get("/pregunta/:id?", async (req, res) =>  {
	
// TODO Feature: En caso de que sea una pregunta borrada, no permitir a menos que se tengan permisos de moderación, o administración.

    try {
			if (req.params.id) {
				const include = [
					{
						model: PostDAO,
						as: 'post',
						include: [
							{
								model: UsuarioDAO,
								as: 'duenio',
                include:PerfilDAO
							}
							,{
								model:VotoDAO
														,separate:true
								,include:{model:UsuarioDAO,as:'votante'}
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
										as: 'duenio',
                    include:PerfilDAO
									},
									{
										model: VotoDAO,
										as: 'votos',
                    required:false
									}
								]
							}
						], 
						order: [['updatedAt', 'DESC']]
					},
					{
						model: EtiquetasPreguntaDAO,
						as: 'etiquetas',
            include: {
              model: EtiquetaDAO,
              include: { model: Categoria, as: "categoria" },
            }
					},
          // TODO Refactor: Agregar la condición de suscripciones solo si req.session.usuario.DNI está definido. No hace falta traer todas, sino solo la que nos interesa. Ver voto como ejemplo.
					{
						model:UsuarioDAO
            			,as: 'usuariosSuscriptos',
						through: {
							model: SuscripcionesPreguntaDAO,
							where: {
								fecha_baja: null // Condición para que la fecha de baja sea nula
							}
						}
					}
				];
		
      const p = await PreguntaDAO.findByPk(req.params.id, { include });

      if (!p) {
        res.status(404).send("ID de pregunta inválida");
        return;
      }

      if (req.session.usuario) {
        NotificacionDAO.findAll({
          include: [
            {
              model: PostDAO,
              include: {
                model: RespuestaDAO,
                as: "respuesta",
              },
            },
          ],
          where: {
            notificadoDNI: req.session.usuario.DNI,
            visto: false,
            [Sequelize.Op.or]: {
              postNotificadoID: req.params.id,
              "$post.respuesta.preguntaID$": req.params.id,
            },
          },
        }).then((notificaciones) => {
          for (let not of notificaciones) {
            not.visto = true;
            not.save();
          }
        });
      }

      // ! No se puede traer votos Y un resumen, por eso lo calculamos acá. Los votos los traemos solo para ver si el usuario actual votó.

      //Ordenar respuestas por valoracion
      function calculateSumValoracion(respuesta) {
        return respuesta.post.votos.reduce(
          (total, voto) => total + voto.valoracion,
          0
        );
      }

      p.respuestas.map((respuesta) => {
        respuesta.dataValues.sumValoracion = calculateSumValoracion(respuesta);
      });
      p.dataValues.respuestas.sort((a, b) => {
        return b.dataValues.sumValoracion - a.dataValues.sumValoracion;
      });

      // TODO UX: Esto no se ve muy lindo. Alternativa: Alguna forma de que la pregunta no renderice el link, y sí renderice un título h-
      let preguntaID = p.ID;
      let pagina = PaginaPregunta(req.path, req.session, preguntaID);
      pagina.titulo = p.titulo;
      p.titulo = "";
      pagina.partes.unshift(new Pregunta(p, pagina.partes[0], req.session));

      pagina.globales.preguntaID = preguntaID;

      res.send(pagina.render());
    } else { 
      let sesion=req.session;
      if (!sesion.usuario) {
        let pagina = SinPermisos(sesion, "No está logueado");
        res.send(pagina.render());
        return;
      }

      // * Nueva pregunta.
      Categoria.findAll({include:{model:EtiquetaDAO, as:'etiquetas'}})
        .then(categorias=>{
          let pagina = PantallaNuevaPregunta(req.path, sesion,categorias);
          res.send(pagina.render());
        })
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});


router.get("/suscripciones", (req, res) => {
  try {
    let usu = req.session;
    if (!usu.usuario) {
      let pagina = SinPermisos(usu, "No está logueado");
      res.send(pagina.render());
      return;
    }

    let pagina = PaginaSuscripciones(req.path, req.session);

    res.send(pagina.render());
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/perfil/info", (req, res) => {
  try {
    let usu = req.session;
    if (!usu.usuario) {
      let pagina = SinPermisos(usu, "No está logueado");
      res.send(pagina.render());
      return;
    }

    let pagina = PaginaPerfilPropioInfo(req.path, req.session);
    res.send(pagina.render());
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/moderacion/usuarios", (req, res) => {
  let usu = req.session;
  if (!usu.usuario) {
    let pagina = SinPermisos(usu, "No está logueado");
    res.send(pagina.render());
    return;
  } else if (usu.usuario.perfil.permiso.ID < 2) {
    let pagina = SinPermisos(usu, "No tiene permisos para ver esta página");
    res.send(pagina.render());
    return;
  }

  let pagina = PantallaModeracionUsuarios(req.path, req.session);
  res.send(pagina.render());
});

router.get('/moderacion/preguntas-y-respuestas',(req,res)=>{
	let usu = req.session;
  if (!usu.usuario) {
    let pagina = SinPermisos(usu, "No está logueado");
    res.send(pagina.render());
    return;
  } else if (usu.usuario.perfil.permiso.ID < 2) {
    let pagina = SinPermisos(usu, "No tiene permisos para ver esta página");
    res.send(pagina.render());
    return;
  }

  let pagina=PantallaModeracionPosts(req.path,req.session);
  res.send(pagina.render());
})

router.get("/perfil/preguntas", (req, res) => {
  try {
    let usu = req.session;
    if (!usu.usuario) {
      let pagina = SinPermisos(usu, "No está logueado");
      res.send(pagina.render());
      return;
    }

    let filtro = { duenioID: null };
    filtro.duenioID = req.session.usuario.DNI;
    PreguntaDAO.pagina(filtro).then((pre) => {
      let pagina = PaginaPerfilPropioPreguntas(req.path, req.session);
      pagina.partes[1] /* ! DesplazamientoInfinito */.entidadesIniciales = pre;

      res.send(pagina.render());
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});


router.get("/pregunta/:id/editar", (req, res)=>{
  try{
    let usu = req.session;
    if(!usu.usuario){
      let pagina = SinPermisos(usu, "No está logueado");
      res.send(pagina.render());
      return;
    }

    const include = [
      {
        model: PostDAO,
        as: 'post',
        where: {
          duenioDNI: req.session.usuario.DNI
        }
      },
      {
        model: EtiquetasPreguntaDAO,
        as: 'etiquetas',
        include: {
          model: EtiquetaDAO,
          include: { model: Categoria, as: "categoria" },
        }
      }
    ];
    Promise.all( [PreguntaDAO.findByPk(req.params.id, { include }) , Categoria.findAll({include:{model:EtiquetaDAO, as:'etiquetas'}})])
    .then(([pre, categorias])=>{
      // * Editar pregunta.
      let pagina = PantallaEditarPregunta(req.path, req.session, pre, categorias);
      res.send(pagina.render());
    }).catch((error) => {
      console.error('Error:', error);
      res.status(409).send('Error al buscar la pregunta');
    });


  }catch(error){
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
})

// TODO Refactor: Ver si se puede unificar el algoritmo de prefil/preguntas y perfil/respuestas
router.get("/perfil/respuestas", (req, res) => {
  try {
    let usu = req.session;
    if (!usu.usuario) {
      let pagina = SinPermisos(usu, "No está logueado");
      res.send(pagina.render());
      return;
    }
    let filtro = { DNI: null };
    filtro.DNI = req.session.usuario.DNI;
    RespuestaDAO.pagina(filtro).then((pre) => {
      let pagina = PaginaPerfilPropioRespuestas(req.path, req.session);
      pagina.partes[1] /* ! DesplazamientoInfinito */.entidadesIniciales = pre;

      res.send(pagina.render());
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/perfil/:DNI?", async (req, res) => {
	// TODO Feature: En caso de que sea un usuario bloqueado, no permitir a menos que se tengan los permisos adecuados.

  //

  //pagina error
  let paginaError = SinPermisos(req.session, "Algo ha malido sal.")
  if(req.params.DNI){
    if(req.session.usuario){
      if(req.session.usuario.DNI==req.params.DNI){
        //perfil propio
        let pagina = PaginaPerfilPropioInfo(req.path, req.session);
        res.send(pagina.render());
        return;
      }
      let usu = await UsuarioDAO.findByPk(req.params.DNI, {
        include: PerfilDAO,
      });
      if (!usu) {
        //no existe el usuario buscado
        res.send(paginaError.render());
        return;
      }
      //Perfil ajeno
      let filtro = { duenioID: null };
      filtro.duenioID = usu.DNI;
      // * Acá sí pedimos antes de mandar para que cargué más rápido y se sienta mejor.
      let pre = await PreguntaDAO.pagina(filtro);
      let pagina = PaginaPerfil(req.path, req.session, usu);
      pagina.partes[2] /* ! DesplazamientoInfinito */.entidadesIniciales =
      pre;
      res.send(pagina.render());
      return;
    }
    //Perfil ajeno
    let usu = await UsuarioDAO.findByPk(req.params.DNI, {
      include: PerfilDAO,
    });
    if (!usu) {
      //no existe el usuario buscado
      res.send(paginaError.render());
      return;
    }
    let filtro = { duenioID: null };
    filtro.duenioID = usu.DNI;
    // * Acá sí pedimos antes de mandar para que cargué más rápido y se sienta mejor.
    let pre = await PreguntaDAO.pagina(filtro);
    let pagina = PaginaPerfil(req.path, req.session, usu);
    pagina.partes[2] /* ! DesplazamientoInfinito */.entidadesIniciales =
    pre;
    res.send(pagina.render());
    return;
  }else{
    if(req.session.usuario){
      //perfil propio
      let pagina = PaginaPerfilPropioInfo(req.path, req.session);
      res.send(pagina.render());
      return;
    }
    //error no hay id ni sesion
    res.send(paginaError.render());
    return;
  }

});

router.get("/usuario/:id?", async (req, res) => {
  //??
  UsuarioDAO.findByPk(req.params.id, {
    raw: true,
    plain: true,
    nest: true,
  }).then((u) => {
    if (!u) {
      res.status(404).send("ID de usuario inválido");
    }

    let usuario = new Usuario(u);
    let chipusuario = new ChipUsuario(usuario.dataValues);

    res.send();
  });
});

router.get("/administracion/parametros", async (req, res) => {
  let usu = req.session;
  if (!usu.usuario) {
    let pagina = SinPermisos(usu, "No está logueado");
    res.send(pagina.render());
    return;
  } else if (usu.usuario.perfil.permiso.ID < 3) {
    let pagina = SinPermisos(usu, "No tiene permisos para ver esta página");
    res.send(pagina.render());
    return;
  }

  const p = await ParametroDAO.findByPk(1);
  let pagina = PantallaAdministracionParametros(req.path, req.session, p);
  pagina.globales.parametros = p;
  res.send(pagina.render());
});

router.get("/administracion/categorias", async (req, res) => {
  let usu = req.session;
  if (!usu.usuario) {
    let pagina = SinPermisos(usu, "No está logueado");
    res.send(pagina.render());
    return;
  } else if (usu.usuario.perfil.permiso.ID < 3) {
    let pagina = SinPermisos(usu, "No tiene permisos para ver esta página");
    res.send(pagina.render());
    return;
  }

  let pagina = PantallaAdministracionCategorias(req.path, req.session);
  res.send(pagina.render());
});

router.get("/administracion/etiquetas", async (req, res) => {
  let usu = req.session;
  if (!usu.usuario) {
    let pagina = SinPermisos(usu, "No está logueado");
    res.send(pagina.render());
    return;
  } else if (usu.usuario.perfil.permiso.ID < 3) {
    let pagina = SinPermisos(usu, "No tiene permisos para ver esta página");
    res.send(pagina.render());
    return;
  }

  let pagina = PantallaAdministracionEtiquetas(req.path, req.session);
  res.send(pagina.render());
});

router.get("/administracion/perfiles", async (req, res) => {
  let usu = req.session;
  if (!usu.usuario) {
    let pagina = SinPermisos(usu, "No está logueado");
    res.send(pagina.render());
    return;
  } else if (usu.usuario.perfil.permiso.ID < 3) {
    let pagina = SinPermisos(usu, "No tiene permisos para ver esta página");
    res.send(pagina.render());
    return;
  }

  let pagina = PantallaAdministracionPerfiles(req.path, req.session);
  res.send(pagina.render());
});


router.get("/administracion/usuarios", async (req, res) => {
  let usu = req.session;
  if (!usu.usuario) {
    let pagina = SinPermisos(usu, "No está logueado");
    res.send(pagina.render());
    return;
  } else if (usu.usuario.perfil.permiso.ID < 3) {
    let pagina = SinPermisos(usu, "No tiene permisos para ver esta página");
    res.send(pagina.render());
    return;
  }
  const query = req.query.searchInput;
  let pagina = PantallaAdministracionUsuarios(req.path, req.session, query);
  res.send(pagina.render());
});

// RUTA DE PRUEBA PARA PROBAR
router.get("/prueba/mensaje", async (req, res) => {
  try {
    let pagina = new Pagina({
      ruta: req.path,
      titulo: "Prueba de Formulario",
      sesion: req.session,
    });

    pagina.partes.push(new MensajeInterfaz(1, "No hay resultados"));
    pagina.partes.push(new MensajeInterfaz(2, "No hay resultados"));

    pagina.partes.push(new Titulo(5, "Desplegable"));
    let desplegable = new Desplegable("myDesplegable", '<i class="fa-solid fa-ellipsis"></i>');
    let form = new Formulario('eliminadorForm', '/api/pregunta/', [],(res)=>{alert(res)},{textoEnviar:'Eliminar',verbo: 'POST' ,clasesBoton: 'is-danger is-outlined'}).render()
    let opciones = [
      {
        descripcion: "Opcion 2",
        tipo: "link",
        href: "#",
      },
      {
        tipo: "form",
        render: form
      },
    ];
    desplegable.opciones = opciones;
    pagina.partes.push(desplegable);

    res.send(pagina.render());
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor de prueba/mensaje");
  }
});

export { router };

        // ,form:opcion=>  new Formulario(
        //     opcion.formID
        //     , opcion.endpoint
        //     , []
        //     ,this.procesarDesuscripcion
        //     ,  {textoEnviar:opcion.textoAEnviar,verbo: opcion.verbo ,clasesBoton:opcion.clasesBotonForm}
        // )   

        