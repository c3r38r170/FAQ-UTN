import { Sequelize, DataTypes } from "sequelize";
import { setModera, setRechazaPost, setReportaPost, setResultadosPorPagina, getPaginacion } from "./parametros.js";
import * as bcrypt from "bcrypt";
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);
/* new Sequelize('faqutn', 'root', 'password', {
    host: 'localhost',
    dialect: 'mariadb'
  }); */

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

const Parametro = sequelize.define("parametro", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  valor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Usuario = sequelize.define("usuario", {
  DNI: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    autoIncrement: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contrasenia: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue(
        "contrasenia",
        bcrypt.hashSync(value, bcrypt.genSaltSync())
      );
    },
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    isEmail: true,
  },
  createdAt: {
    field: "fecha_alta",
    type: DataTypes.DATE,
  },
});

const Bloqueo = sequelize.define("bloqueo", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: () => new Date().toISOString(),
  },
  createdAt: {
    type: DataTypes.VIRTUAL(DataTypes.DATE, ["fecha"]),
  },
  motivo_desbloqueo: {
    type: DataTypes.STRING,
  },
  fecha_desbloqueo: {
    type: DataTypes.DATEONLY,
  },
});
// TODO Refactor: Considerar algo como Usuario.Bloqueos=... https://sequelize.org/docs/v6/advanced-association-concepts/creating-with-associations/#belongsto--hasmany--hasone-association
Usuario.hasMany(Bloqueo, {
  as: "bloqueosRealizados",
  constraints: false,
  foreignKey: "bloqueadorDNI",
});

Bloqueo.belongsTo(Usuario, {
  as: "bloqueador",
  constraints: false,
});

Usuario.hasMany(Bloqueo, {
  as: "bloqueosRecibidos",
  constraints: false,
  foreignKey: "bloqueadoDNI",
});

Bloqueo.belongsTo(Usuario, {
  as: "bloqueado",
  constraints: false,
});

Usuario.hasMany(Bloqueo, {
  as: "desbloqueosRealizados",
  constraints: false,
  foreignKey: "desbloqueadorDNI",
});

Bloqueo.belongsTo(Usuario, {
  as: "desbloqueador",
  constraints: false,
});

const ReportesUsuario = sequelize.define("reporteUsuarios", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: () => new Date().toISOString(),
  },
  createdAt: {
    type: DataTypes.VIRTUAL(DataTypes.DATE, ["fecha"]),
  },
});

Usuario.hasMany(ReportesUsuario, {
  as: "reportesRecibidos",
  constraints: false,
  foreignKey: "reportadoDNI",
});

ReportesUsuario.belongsTo(Usuario, {
  as: "reportado",
  constraints: false,
});

Usuario.hasMany(ReportesUsuario, {
  as: "reportesRealizados",
  constraints: false,
  foreignKey: "reportanteDNI",
});

ReportesUsuario.belongsTo(Usuario, {
  as: "reportante",
  constraints: false,
});

const Post = sequelize.define(
  "post",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cuerpo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: () => new Date().toISOString(),
    },
    createdAt: {
      type: DataTypes.VIRTUAL(DataTypes.DATE, ["fecha"]),
    },
  },
  {
    indexes: [
      {
        type: "FULLTEXT",
        fields: ["cuerpo"],
      },
    ],
  }
);

Usuario.hasMany(Post, {
  constraints: false,
  foreignKey: "duenioDNI",
});

Post.belongsTo(Usuario, {
  as: "duenio",
  constraints: false,
});

Usuario.hasMany(Post, {
  as: "postsEliminados",
  constraints: false,
  foreignKey: "eliminadorDNI",
});

Post.belongsTo(Usuario, {
  as: "eliminador",
  constraints: false,
});

const Notificacion = sequelize.define("notificacion", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  visto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

Usuario.hasMany(Notificacion, {
  as: "notificaciones",
  constraints: false,
  foreignKey: "notificadoDNI",
});

Notificacion.belongsTo(Usuario, {
  constraints: false,
  foreignKey: "notificadoDNI",
});

Post.hasMany(Notificacion, {
  as: "notificaciones",
  constraints: false,
  foreignKey: "postNotificadoID",
});

Notificacion.belongsTo(Post, {
  constraints: false,
  foreignKey: "postNotificadoID",
});

const Voto = sequelize.define("voto", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valoracion: {
    type: DataTypes.INTEGER,
  },
});

Usuario.hasMany(Voto, {
  constraints: false,
  foreignKey: "votanteDNI",
});

Voto.belongsTo(Usuario, {
  as: "votante",
  constraints: false,
});

Post.hasMany(Voto, {
  constraints: false,
  foreignKey: "votadoID",
});

Voto.belongsTo(Post, {
  as: "votado",
  constraints: false,
});

// * Reportes de post. No de usuarios.
const TipoReporte = sequelize.define('tipoReporte', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

TipoReporte.upsert({
  ID: 1,
  descripcion: "Comportamiento abusivo / vulgar"
})

TipoReporte.upsert({
  ID: 2,
  descripcion: "Pregunta repetida"
})

const ReportePost = sequelize.define("reportePost", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  createdAt: {
    field: "fecha",
    type: DataTypes.DATE,
  },
});

TipoReporte.hasMany(ReportePost, {
  constraints: false,
  foreignKey: "tipoID",
});

ReportePost.belongsTo(TipoReporte, {
  as: "tipo",
  constraints: false,
});

Usuario.hasMany(ReportePost, {
  constraints: false,
  foreignKey: "reportanteDNI",
});

ReportePost.belongsTo(Usuario, {
  as: "reportante",
  constraints: false,
});

Post.hasMany(ReportePost, {
  constraints: false,
  foreignKey: "reportadoID",
});

ReportePost.belongsTo(Post, {
  as: "reportado",
  constraints: false,
});

const Perfil = sequelize.define("perfil", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    //HEX
    type: DataTypes.STRING,
    allowNull: false,
  },
  activado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
});

Perfil.hasMany(Usuario, {
  as: "rol",
  constraints: false,
  foreignKey: "perfilID",
});

Usuario.belongsTo(Perfil, {
  constraints: false,
});

const Permiso = sequelize.define("permiso", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Permiso.hasOne(Perfil, {
  constraints: false,
});

Perfil.belongsTo(Permiso, {
  constraints: false,
});

Permiso.upsert({
  ID: 1,
  descripcion: "Solo tiene permisos básicos",
});
Permiso.upsert({
  ID: 2,
  descripcion: "Puede moderar",
});
Permiso.upsert({
  ID: 3,
  descripcion: "Puede administrar listas",
});

const Respuesta = sequelize.define("respuesta", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
  },
  fecha: {
    type: DataTypes.VIRTUAL(DataTypes.DATE, ["post.fecha"]),
    get() {
      return this.post.fecha;
    },
    set(value) {
      this.post.setDataValue("fecha", value);
    },
  },
  cuerpo: {
    type: DataTypes.VIRTUAL(DataTypes.STRING, ["post.cuerpo"]),
    get() {
      return this.post.cuerpo;
    },
    set(value) {
      this.post.setDataValue("cuerpo", value);
    },
  },
});

Respuesta.hasOne(Post, {
  constraints: false,
  foreignKey: "ID",
});

Post.belongsTo(Respuesta, {
  constraints: false,
  as: "respuesta",
  foreignKey: "ID",
});

const respuestasCount = [
  sequelize.literal(
    "(SELECT COUNT(*) FROM respuesta join posts on posts.ID = respuesta.ID WHERE respuesta.preguntaID = pregunta.ID and posts.eliminadorDNI is null)"
  ),
  "respuestasCount",
]

const Pregunta = sequelize.define(
  "pregunta",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.VIRTUAL(DataTypes.DATE, ["post.fecha"]),
      get() {
        return this.post.fecha;
      },
      set(value) {
        this.post.setDataValue("fecha", value);
      },
    },
    cuerpo: {
      type: DataTypes.VIRTUAL(DataTypes.STRING, ["post.cuerpo"]),
      get() {
        return this.post.cuerpo;
      },
      set(value) {
        this.post.setDataValue("cuerpo", value);
      },
    },
    respuestasCount: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.dataValues?.respuestasCount;
      },
    },
  },
  {
    indexes: [
      {
        type: "FULLTEXT",
        fields: ["titulo"],
      },
    ],
  }
);


/* *
Ejemplo de filtro por asociación de la documentación:
User.findAll({
  where: {
    '$Instruments.size$': { [Op.ne]: 'small' }
  },
  include: [{
    model: Tool,
    as: 'Instruments'
  }]
});

Ejemplo de asociar todo:
User.findAll({ include: { all: true }});

Fuente: https://stackoverflow.com/questions/18838433/sequelize-find-based-on-association
*/

Pregunta.pagina = ({ pagina = 0, duenioID: duenioDNI, filtrar, formatoCorto, usuarioActual } = {}) => {
  // TODO Refactor: DRY en los include.
  // * Las etiquetas desativadas no se quitan de las preguntas viejas.
  /*
  1) Inicio: Pregunta completas, ordenada por más recientes
    Esto es la funcion `.pagina()`.
  2) Búsqueda: Pregunta completas, filtradas por texto y etiquetas, ordenada por coincidencia
  3) Perfil: Preguntas completas, filtradas por usuario, ordenada por más recientes
  4) Sugerencias: Solo título e ID, filtradas por texto de título y cuerpo, ordenada por coincidencia
      5) Suscripciones: Preguntas completas, filtradas por suscripciones, ordenadas por más recientes

      Agrupación lógica:
          1, 3 y 5: formato largo, filtro por usuario actual y orden más reciente
          2, 4: Filtro por texto, y orden por coincidencia

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
      - Usuarios suscriptos
          - Probablemente solo ID
  El formato corto:
  - Pregunta / título
  - ID

  Parámetros para lograr esto:
  {
    filtro:null (puede ser texto (busqueda o titulo+cuerpo por sugerencia), vacío, o un objeto con texto, etiquetas o si es por suscripciones; si texto está definido, se ordena por coincidencia)

    formatoCorto:false (booleano. Todos los datos o solo pregunta/título e ID)

    duenioID:null (duenioID, )

    pagina: Paginación, paralelo a cualquier conjunto de las superiores
  }
*/
  const INCLUDE_ETIQUETAS={
    model: EtiquetasPregunta,
    required: true,
    as: "etiquetas",
    include: {
      model: Etiqueta,
      include:[
        {
          model: Categoria,
          as: "categoria",
        }
      ],
    },
    separate: true
  };

  if(usuarioActual){
    INCLUDE_ETIQUETAS.include.include.push({
      model:SuscripcionesEtiqueta
      ,as:'suscripciones'
      ,separate: true
      ,where:{
        suscriptoDNI:usuarioActual.DNI,
        fecha_baja:null
      }
    });
  }

  if (duenioDNI) { // * Esto es para los perfiles.
    // ! Esto no considera ningún filtro.
    let opciones = {
      include: [
        {
          model: Post,
          required: true,
          where: { eliminadorDNI: { [Sequelize.Op.is]: null } }, // * Preguntas vigentes.
          include: [
            {
              model: Voto
              , separate: true
              , include: { model: Usuario, as: 'votante' }
            }
            // TODO Refactor: 2 Usuario???
            , {
              model: Usuario
              , as: 'duenio'
              , include: {
                model: Perfil
                , attributes: ['ID', 'descripcion', 'color']
              }
              , attributes: ['DNI', 'nombre']
              , where: {
                DNI: duenioDNI
              }
            },
            {
              model: Usuario,
              as: "duenio",
              include: {
                model: Perfil,
                attributes: ["ID", "descripcion", "color"],
              },
              attributes: ["DNI", "nombre"],
            },
          ],
        },
        {
          ...INCLUDE_ETIQUETAS,
          required: true
        }
      ],
      attributes: {
        include: [
          respuestasCount,
        ],
      },
      order: [[Post, "fecha", "DESC"]],
      limit: getPaginacion().resultadosPorPagina,
      offset: +pagina * getPaginacion().resultadosPorPagina,
      // * Recuerden que raw y nest mata las fechas.
    };

    if (usuarioActual) {
      let opcionesSuscripciones = {
        model: SuscripcionesPregunta
        , as: 'suscripciones'
        , include: { model: Usuario, as: 'suscripto', where: { DNI: usuarioActual.DNI }, attributes: [] }
        , where: {
          fecha_baja: null // * Vigentes
        }
        , separate: true
      };
      opciones.include.push(opcionesSuscripciones)
    }

    return Pregunta.findAll(opciones);

  } else {
    let opciones = {
      // raw:true,
      include: [
        { model: Post, required: true, where: { eliminadorDNI: { [Sequelize.Op.is]: null } } }
      ],
      limit: getPaginacion().resultadosPorPagina,
      offset: (+pagina) * getPaginacion().resultadosPorPagina,
      subQuery: false,
      attributes: {
        include: [
          respuestasCount,
        ],
      }
    };

    let filtrarEtiquetas = false,
      filtrarTexto = false;

    if (filtrar) {
      if (filtrar.texto) {
        opciones.where = Sequelize.or(
          Sequelize.literal(
            `match(post.cuerpo) against (:where_cuerpo IN BOOLEAN MODE)`
          ),
          Sequelize.literal(
            `match(titulo) against (:where_titulo IN BOOLEAN MODE)`
          )
        )
        let valorAgainstMatch = `${filtrar.texto}*`;
        opciones.replacements = {
          where_cuerpo: valorAgainstMatch
          , where_titulo: valorAgainstMatch
        };
        filtrarTexto = true;
      }

      if (filtrar.etiquetas) {
        opciones.include.push(
          INCLUDE_ETIQUETAS
          , {
            model: EtiquetasPregunta,
            as: "filtroEtiquetas",
            required: true
            , where: {
              etiquetumID: filtrar.etiquetas
            }
          }
        );
        if (!opciones.replacements)
          opciones.replacements = {};
        let variablesEnConsulta = filtrar.etiquetas.map(eti => {
          let nombreVariable = 'eti_' + eti
          opciones.replacements[nombreVariable] = eti;
          return ':' + nombreVariable;
        });
        opciones.attributes.include.push(
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM etiquetasPregunta WHERE etiquetasPregunta.preguntumID = pregunta.ID AND etiquetasPregunta.etiquetumID IN(${variablesEnConsulta.join()}))`
            ),
            "coincidencias",
          ]
        )

        filtrarEtiquetas = true;
      }
    }

    // TODO Feature: Ordenar respuestas por relevancia, y por fecha
    /* if(filtrar){ // && !formatoCorto ){
        // Búsqueda: Agregar relevancia por votaciones y respuestas... Desarrollar algoritmo de puntaje teniendo en cuenta todo.
        // opciones.attributes={include:[Sequelize.literal('(SELECT COUNT(r.*)*2 FROM respuestas ON )'),'puntuacion']}
    }else{
        opciones.order=[[Post,'fecha','DESC']];
    } */
    // ? ¿Agregar las etiquetas al ranking / relevancia?
    /* 
      etiquetas: 1...n
      texto: 0...2
      votaciones: 0...n
      respuestas: 0...n
      ¿Meter los votos de la respuesta más votada / de las respuestas?
    */
    let ordenadoPorFecha = [[Post, "fecha", "DESC"]];
    if (filtrarEtiquetas || filtrarTexto) {//filtrar siempre esta? viene como objeto vació tonces entra en el if
      let ranking = [];
      if (filtrarTexto) {
        ranking.push(`(match(post.cuerpo) against (:order_cuerpo IN BOOLEAN MODE) + match(titulo) against (:order_titulo IN BOOLEAN MODE)*2)`);
        // * En la definición del where se establece replacements con un par de el mismo valor.
        opciones.replacements['order_cuerpo'] =
          opciones.replacements['order_titulo'] =
          opciones.replacements['where_cuerpo']
      }
      if (filtrarEtiquetas) {
        ranking.push(`coincidencias/${filtrar.etiquetas.length}`) // * 0..1
      }
      ranking.push(`((SELECT COUNT(*) FROM respuesta join posts on posts.ID = respuesta.ID WHERE respuesta.preguntaID = pregunta.ID and posts.eliminadorDNI is null)+1)*0.1`)  //cada respuesta suma 0.1 punto, normalizarlo para que el maximo sea 1?
      ranking.push('((select coalesce(sum(valoracion),1) from votos where votadoID = pregunta.ID)+1)*0.1') // cada voto suma 0.1 punto, normalizar?
      opciones.order = [
        Sequelize.literal(ranking.join(' * ') + ' desc') // ! Si hay uno sono, no se multiplica nada.
        , ordenadoPorFecha
      ]
    } else {
      opciones.order = [ordenadoPorFecha];
    }

    if (formatoCorto) {
      // TODO Feature: Ver qué más trae esto, eliminar lo que no haga falta. Ideas: Agregar raw, manipular array conseguido para mandar objetos reducidos
      opciones.attributes = ['ID', 'titulo'];
      opciones.raw = true;
    } else {
      // * Datos propios

      // ! include[0] es Post por default
      opciones.include[0].include = [
        {
          model: Voto
          , separate: true
          , include: { model: Usuario, as: 'votante' }
        }
        , {
          model: Usuario
          , as: 'duenio'
          , include: [
            {
              model: Perfil
              , attributes: ['ID', 'descripcion', 'color']
            }
            // TODO DRY: Esto está en varios lugares.
            ,{
              model:Bloqueo,
              as: "bloqueosRecibidos",
              required:false,
              separate:true,
              where:{fecha_desbloqueo:null}
              ,attributes:['ID'] // * No necesitamos nada mas que saber si está bloqueado.
            }
          ]
          , attributes: ['DNI', 'nombre']
        }
      ];

      // TODO Refactor: Solo hace falta si hay una sesión, y solo hace falta mandar para saber si el usuario está suscrito o no. Ver ejemplo en votos.
      if (usuarioActual) {
        let opcionesSuscripciones = {
          model: SuscripcionesPregunta
          , as: 'suscripciones'
          , where: {
            fecha_baja: null // * Vigentes
          }
        };

        if (filtrar?.suscripciones) {
          opcionesSuscripciones.where.suscriptoDNI = usuarioActual.DNI;
        } else {
          opcionesSuscripciones.include = { model: Usuario, as: 'suscripto', where: { DNI: usuarioActual.DNI } };
          opcionesSuscripciones.required = false;
          // ! No hace falta separate, porque un usuario siempre va a tener una sola suscripcion a cada pregunta (o ninguna). 
        }

        opciones.include.push(opcionesSuscripciones);
      }

      if (!filtrarEtiquetas) {
        opciones.include.push(INCLUDE_ETIQUETAS);
      }
    }

    return Pregunta.findAll(opciones);
  }
}

// TODO Refactor: duenioDNI
Post.pagina = ({ pagina = 0, DNI } = {}) => {
  // TODO Refactor: Debería usarse Post.findAll ... Ver ejemplo en Notificaciones.
  return Pregunta.findAll({
    include: [
      {
        model: Post,
        where: { eliminadorDNI: { [Sequelize.Op.is]: null } },
        include: [
          /* TODO Refactor: Esto estaba 2 veces, ver si hacía falta??{
            model: Usuario,
            as: "duenio",
            include: [
              {
                model: Perfil
              }
              
            ],
          }, */
          {
            model: Voto
            , separate: true
            , include: { model: Usuario, as: 'votante' }
          }
          , {
            model: Usuario
            , as: 'duenio'
            , include: [
              {
                model: Perfil
                , attributes: ['ID', 'descripcion', 'color']
              }
              // TODO Refactor: DRY: Esto está en varios lugares.
              ,{
                model:Bloqueo,
                as: "bloqueosRecibidos",
                required:false,
                separate:true,
                where:{fecha_desbloqueo:null}
                ,attributes:['ID'] // * No necesitamos nada mas que saber si está bloqueado.
              }
            ]
            , attributes: ['DNI', 'nombre']
          }
        ],
      },
      {
        model: Respuesta,
        as: "respuestas",
        required: false,
        include: {
          model: Post,
          where: { eliminadorDNI: null },
          include: [
            {
              model: Usuario,
              as: "duenio",
              include: [
                {
                  model: Perfil,
                }
                // TODO Refactor: DRY: Esto está en varios lugares.
                ,{
                  model:Bloqueo,
                  as: "bloqueosRecibidos",
                  required:false,
                  separate:true,
                  where:{fecha_desbloqueo:null} // * Todavía bloqueado, un bloqueo vigente. No debería haber más de uno al mismo tiempo.
                  ,attributes:['ID'] // * No necesitamos nada mas que saber si está bloqueado.
                }
              ]
            },
            {
              model: Voto,
              separate: true,
              // TODO Refactor: Hace falta todos los votantes??
              include: { model: Usuario, as: "votante" },
            },
          ],
        },
      },
      {
        model: EtiquetasPregunta,
        required: true,
        as: "etiquetas",
        include: {
          model: Etiqueta,
          include: {
            model: Categoria,
            as: "categoria",
          },
        },
        separate: true,
      },
      {
        model: SuscripcionesPregunta
        , as: 'suscripciones'
        , include: { model: Usuario, as: 'suscripto' }
        , where: {
          fecha_baja: null, // * Vigentes
        }
        , required: false
      }
    ],
    attributes: {
      include: [
        respuestasCount,
      ],
    },
    separate: true,
    where: {
      [Sequelize.Op.or]: [
        { "$respuestas.post.duenio.DNI$": DNI, },
        { "$post.duenio.DNI$": DNI, },
      ]
    },
    subQuery: false,
    order: [[Post, "fecha", "DESC"]],
    limit: getPaginacion().resultadosPorPagina,
    offset: +pagina * getPaginacion().resultadosPorPagina,
  });
};

Respuesta.pagina = ({ pagina = 0, DNI } = {}) => {
  return Pregunta.findAll({
    include: [
      {
        model: Post,
        where: { eliminadorDNI: { [Sequelize.Op.is]: null } },
        include: [
          {
            model: Voto
            , separate: true
            , include: { model: Usuario, as: 'votante' }
          }
          , {
            model: Usuario
            , as: 'duenio'
            , include: {
              model: Perfil
              , attributes: ['ID', 'descripcion', 'color']
            }
            , attributes: ['DNI', 'nombre']
          }
        ],
      },
      {
        model: Respuesta,
        as: "respuestas",
        required: true,
        include: {
          model: Post,
          where: { eliminadorDNI: { [Sequelize.Op.is]: null } },
          include: [
            {
              model: Usuario,
              as: "duenio",
              include: {
                model: Perfil,
              },
            },
            {
              model: Voto,
              separate: true,
              include: { model: Usuario, as: "votante" },
            },
          ],
        },
      },
      {
        model: EtiquetasPregunta,
        required: true,
        as: "etiquetas",
        include: {
          model: Etiqueta,
          include: {
            model: Categoria,
            as: "categoria",
          },
        },
        separate: true
      },
      {
        model: SuscripcionesPregunta
        , as: 'suscripciones'
        , include: { model: Usuario, as: 'suscripto' }
        , where: {
          fecha_baja: null, // * Vigentes
        }
        , required: false
        , separate: true
      }
    ],
    attributes: {
      include: [
        respuestasCount,
      ],
    },
    separate: true,
    where: {
      "$respuestas.post.duenio.DNI$": DNI,
    },
    subQuery: false,
    order: [[Post, "fecha", "DESC"]],
    limit: getPaginacion().resultadosPorPagina,
    offset: +pagina * getPaginacion().resultadosPorPagina,
  });
};

Pregunta.hasOne(Post, {
  constraints: false,
  foreignKey: "ID",
});

Post.belongsTo(Pregunta, {
  constraints: false,
  as: "pregunta",
  foreignKey: "ID",
});

Pregunta.hasMany(Respuesta, {
  as: "respuestas",
  constraints: false,
  foreignKey: "preguntaID",
});

Respuesta.belongsTo(Pregunta, {
  constraints: false,
  as: "pregunta",
});

const Etiqueta = sequelize.define("etiqueta", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
});

const EtiquetasPregunta = sequelize.define("etiquetasPregunta", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

Pregunta.hasMany(EtiquetasPregunta, {
  as: "etiquetas",
  constraints: false,
});

// ! Esta asociación es para filtrar las etiquetas, la otra, para recibirlas. De no usar esto, solo se podrían conseguir las etiquetas por las que se filtran.
Pregunta.hasMany(EtiquetasPregunta, {
  as: "filtroEtiquetas",
  constraints: false,
});

EtiquetasPregunta.belongsTo(Etiqueta, { constraints: false });
EtiquetasPregunta.belongsTo(Pregunta, { constraints: false });

const Categoria = sequelize.define("categoria", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
});

Categoria.todasConEtiquetas = () => {

}

Categoria.hasMany(Etiqueta, {
  constraints: false,
  foreignKey: "categoriaID",
  as: 'etiquetas'
});

Etiqueta.belongsTo(Categoria, {
  as: "categoria",
  constraints: false,
});

const SuscripcionesEtiqueta = sequelize.define("suscripcionesEtiqueta", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  createdAt: {
    field: "fecha",
    type: DataTypes.DATE,
  },
  fecha_baja: {
    type: DataTypes.DATE,
  },
});

Etiqueta.hasMany(SuscripcionesEtiqueta, {
  as: "suscripciones",
  constraints: false,
  foreignKey: 'etiquetaID'
});

SuscripcionesEtiqueta.belongsTo(Usuario, { constraints: false, as: 'suscripto', foreignKey: 'suscriptoDNI' });

/* 
Usuario.belongsToMany(Etiqueta, {
  through: SuscripcionesEtiqueta,
  constraints: false,
  as: "etiquetasSuscriptas",
  foreignKey: "suscriptoDNI",
});

Etiqueta.belongsToMany(Usuario, {
  through: SuscripcionesEtiqueta,
  constraints: false,
  as: "suscriptos",
  foreignKey: "etiquetaID",
});
 */

const SuscripcionesPregunta = sequelize.define("suscripcionesPregunta", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  createdAt: {
    field: "fecha",
    type: DataTypes.DATE,
  },
  fecha_baja: {
    type: DataTypes.DATE,
  },
});

Pregunta.hasMany(SuscripcionesPregunta, {
  as: "suscripciones",
  constraints: false,
  foreignKey: 'preguntaID'
});

SuscripcionesPregunta.belongsTo(Usuario, { constraints: false, as: 'suscripto', foreignKey: 'suscriptoDNI' });

Usuario.belongsToMany(Pregunta, {
  through: SuscripcionesPregunta,
  constraints: false,
  as: 'preguntasSuscriptas',
  foreignKey: 'suscriptoDNI'
});

Pregunta.belongsToMany(Usuario, {
  through: SuscripcionesPregunta,
  constraints: false,
  as: 'usuariosSuscriptos',
  foreignKey: 'preguntaID'
});

const Carrera = sequelize.define("carrera", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Carrera.upsert({
  ID: 1,
  nombre: "Ingeniería Civil"
})
Carrera.upsert({
  ID: 2,
  nombre: "Ingeniería Eléctrica"
})
Carrera.upsert({
  ID: 3,
  nombre: "Ingeniería Química"
})
Carrera.upsert({
  ID: 4,
  nombre: "Ingeniería Mecánica"
})
Carrera.upsert({
  ID: 5,
  nombre: "Ingeniería en Sistemas de Información"
})

const CarrerasUsuario = sequelize.define("carrerasUsuario", {
  // TODO Refactor: legajo, con minúscula
  Legajo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
  },
});

Usuario.belongsToMany(Carrera, {
  through: CarrerasUsuario,
  constraints: false,
});

Carrera.belongsToMany(Usuario, {
  through: CarrerasUsuario,
  constraints: false,
});



Parametro.findAll().then((parametros) => {
  parametros.forEach((p) => {
    if (p.ID == 1)
      setResultadosPorPagina(p.valor);
    if (p.ID == 2) setModera(p.valor);
    if (p.ID == 3) setRechazaPost(p.valor);
    if (p.ID == 4) setReportaPost(p.valor);
  });
});

export {
  Parametro,
  Carrera,
  CarrerasUsuario,
  SuscripcionesPregunta,
  Usuario,
  Bloqueo,
  ReportesUsuario,
  Post,
  Notificacion,
  Voto,
  TipoReporte,
  ReportePost,
  Perfil,
  Permiso,
  Respuesta,
  Pregunta,
  Etiqueta,
  EtiquetasPregunta,
  Categoria,
  SuscripcionesEtiqueta,
};