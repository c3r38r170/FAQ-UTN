import {Sequelize, DataTypes} from 'sequelize';

import * as bcrypt from "bcrypt";

const sequelize = new Sequelize(
    'faqutn',
    'vj6h6slqojgkqj8l6upf',
    'pscale_pw_KXyc9Io7oS063MsqgHyxpk4ob4iJoV6eu5EK2fwOjxj',
     {
       host: 'aws.connect.psdb.cloud',
       dialect: 'mysql',
       dialectOptions: {
        ssl: {
          rejectUnauthorized: true,
        },
      },
    //   logging: false,
     }
   );
   /* new Sequelize('faqutn', 'root', 'password', {
    host: 'localhost',
    dialect: 'mariadb'
  }); */
   
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});


const Usuario = sequelize.define('usuario', {
    DNI: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        autoIncrement:false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contrasenia: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value){
            this.setDataValue('contrasenia', bcrypt.hashSync(value, bcrypt.genSaltSync()));
        }
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        isEmail: true
    },
    createdAt:{
        field:'fecha_alta',
        type:DataTypes.DATE,
    }
});

const Bloqueo = sequelize.define('bloqueo',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha:{
        type:DataTypes.DATE,
        defaultValue: ()=> new Date().toISOString()
    },
    createdAt:{
        type: DataTypes.VIRTUAL(DataTypes.DATE, ['fecha'])
    },
    motivo_desbloqueo: {
        type: DataTypes.STRING
    },
    fecha_desbloqueo: {
        type: DataTypes.DATEONLY
    }
});

Usuario.hasMany(Bloqueo, {
    as:'bloqueosRealizados',
    constraints :false,
    foreignKey: 'bloqueadorDNI',
});

Bloqueo.belongsTo(Usuario,{
    as:'bloqueador'
    ,constraints:false
})

Usuario.hasMany(Bloqueo, {
    as:'bloqueosRecibidos',
    constraints :false,
    foreignKey: 'bloqueadoDNI',
});

Bloqueo.belongsTo(Usuario,{
    as:'bloqueado'
    ,constraints:false
})

Usuario.hasMany(Bloqueo, {
    as:'desbloqueosRealizados',
    constraints :false,
    foreignKey: 'desbloqueadorDNI',
});

Bloqueo.belongsTo(Usuario,{
    as:'desbloqueador'
    ,constraints:false
})


const ReportesUsuario = sequelize.define('reporteUsuarios',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha:{
        type:DataTypes.DATE,
        defaultValue: ()=> new Date().toISOString()
    },
    createdAt:{
        type: DataTypes.VIRTUAL(DataTypes.DATE, ['fecha'])
    }
});

Usuario.hasMany(ReportesUsuario, {
    as: 'reportesRecibidos',
    constraints: false,
    foreignKey: 'reportadoDNI'
});

ReportesUsuario.belongsTo(Usuario,{
    as:'reportado'
    ,constraints:false
})

Usuario.hasMany(ReportesUsuario, {
    as: 'reportesRealizados',
    constraints: false,
    foreignKey: 'reportanteDNI'
});

ReportesUsuario.belongsTo(Usuario,{
    as:'reportante'
    ,constraints:false
})

const Post = sequelize.define('post',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cuerpo:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha:{
        type:DataTypes.DATE,
        defaultValue: ()=> new Date().toISOString()
    },
    createdAt:{
        type: DataTypes.VIRTUAL(DataTypes.DATE, ['fecha'])
    }
},{
    indexes:[
        {
          type: 'FULLTEXT', fields:['cuerpo']
        }
    ]
})

Usuario.hasMany(Post, {
    constraints:false,
    foreignKey:'duenioDNI'
})

Post.belongsTo(Usuario,{
    as:'duenio'
    ,constraints:false
})

Usuario.hasMany(Post, {
    as: 'postsEliminados',
    constraints:false,
    foreignKey:'eliminadorDNI'
})

Post.belongsTo(Usuario,{
    as:'eliminador'
    ,constraints:false
})

const Notificacion = sequelize.define('notificacion',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    visto:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
})

Usuario.hasMany(Notificacion,{
    as: 'notificaciones',
    constraints: false,
    foreignKey: 'notificadoDNI'
})

Notificacion.belongsTo(Usuario,{
    constraints:false,
    foreignKey: 'notificadoDNI'
})

Post.hasMany(Notificacion, {
    as: 'notificaciones',
    constraints: false,
    foreignKey: 'postNotificadoID'
})

Notificacion.belongsTo(Post,{
    constraints:false,
    foreignKey: 'postNotificadoID'
})

const Voto = sequelize.define('voto', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    valoracion:{
        type:DataTypes.INTEGER
    }
})

Usuario.hasMany(Voto,{
    // as:'votante',
    constraints:false,
    foreignKey:'votanteDNI'
})

Voto.belongsTo(Usuario,{
    as:'votante',
    constraints:false
});

Post.hasMany(Voto,{
    // as:'votado',
    constraints:false,
    foreignKey:'votadoID'
})

Voto.belongsTo(Post,{
    as:'votado',
    constraints:false
});

const TipoReporte = sequelize.define('tipoReporte',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion:{
        type: DataTypes.STRING,
        allowNull:false
    }
})

const ReportePost = sequelize.define('reportePost', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    createdAt:{
        field:'fecha',
        type:DataTypes.DATE,
    }
})

TipoReporte.hasMany(ReportePost,{
    constraints:false,
    foreignKey:'tipoID'
})

ReportePost.belongsTo(TipoReporte,{
    as: 'tipo',
    constraints:false
});

Usuario.hasMany(ReportePost,{
    constraints:false,
    foreignKey: 'reportanteDNI'
});

ReportePost.belongsTo(Usuario,{
    as:'reportante',
    constraints:false
});

Post.hasMany(ReportePost,{
    constraints:false,
    foreignKey:'reportadoID'
})

ReportePost.belongsTo(Post,{
    as:'reportado',
    constraints:false
});

const Perfil = sequelize.define('perfil',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // TODO Refactor: cambiar a Descripcion
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

Perfil.hasMany(Usuario,{
    as:'rol',
    constraints:false,
    foreignKey:'perfilID'
})

Usuario.belongsTo(Perfil,{
    constraints:false
});

const Permiso = sequelize.define('permiso',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion:{
        type: DataTypes.STRING,
        allowNull:false
    }
})

const PerfilesPermiso = sequelize.define('perfilesPermiso', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

Perfil.belongsToMany(Permiso, {
    through: PerfilesPermiso,
    constraints:false
});

Permiso.belongsToMany(Perfil, { 
    through: PerfilesPermiso ,
    constraints:false
});

const Respuesta = sequelize.define('respuesta',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    fecha:{
        type: DataTypes.VIRTUAL(DataTypes.DATE, ['post.fecha']),
        get(){
            return this.post.fecha;
        },
        set(value){
            this.post.setDataValue('fecha', value);
        }
    },
    cuerpo:{
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['post.cuerpo']),
        get(){
            return this.post.cuerpo;
        },
        set(value){
            this.post.setDataValue('cuerpo', value);
        }
    }
})

Respuesta.hasOne(Post,{
    constraints:false,
    foreignKey:'ID'
})

Post.belongsTo(Respuesta,{
    constraints:false,
    as:'respuesta',
    foreignKey:'ID'
})

const Pregunta = sequelize.define('pregunta',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:false,
    },
    titulo:{
        type:DataTypes.STRING,
        allowNull:false
    },
    fecha:{
        type: DataTypes.VIRTUAL(DataTypes.DATE, ['post.fecha']),
        get(){
            return this.post.fecha;
        },
        set(value){
            this.post.setDataValue('fecha', value);
        }
    },
    cuerpo:{
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['post.cuerpo']),
        get(){
            return this.post.cuerpo;
        },
        set(value){
            this.post.setDataValue('cuerpo', value);
        }
    }
},{
    indexes:[
        {
          type: 'FULLTEXT', fields:['titulo']
        }
    ]
})

// TODO Refactor: Llevar arriba de todo si se define que va a quedar acá.
const PAGINACION={
	resultadosPorPagina:10
}

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



Pregunta.pagina=({pagina=0,duenioID,filtrar,formatoCorto}={})=>{
    // TODO Feature: NO traer la primera respuesta. Por otro lado, sí traer la _cantidad_ de respuestas. https://stackoverflow.com/questions/56149251/node-js-sequelize-virtual-column-pulling-value-from-other-model
	/*
		1) Inicio: Pregunta y primera respuesta, ordenada por más recientes
			Esto es la funcion .pagina().
		2) Búsqueda: Pregunta y primera respuesta, filtrado por texto y etiquetas, ordenada por coincidencia
		3) Perfil: Preguntas y primera respuesta, filtradas por usuario, ordenada por más recientes
		4) Sugerencias: Solo título e ID, filtrado por texto de título y cuerpo, ordenada por coincidencia

        Las suscripciones se obtienen indirectamente por notificaciones, no acá.
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
		f. corto | sugerencia |      -

		if(req.query.duenioID){
			// devolver en formato largo y sin filtros, según el dueño
		}else{
			if(req.query.filtros){
				// Ver si el filtro es solo texto o etiquetas también
				// Agregar filtro de match al where, y de etiquetas.
			}
			if(req.query.formatoCorto){
				// Agregar raw, y eso para que sean pocos datos. No hace falta cruzar con casi nada.
				// Otra opción es manipular lo que se obtiene para mandar objetos reducidos.
			}

			if(req.query.filtros && !req.query.formatoCorto){
				// Búsqueda: Agregar relevancia por votaciones y respuestas... Desarrollar algoritmo de puntaje teniendo en cuenta todo.
			}

			// Devolver lo que se obtuvo, como objeto...
		}
	*/
	
	if(duenioID){
		return Pregunta.findAll({
			// TODO Feature: try subQUery:false again and separate: true
			include: [
                {
                    model: Post,
                    include: [
                        {
                            // TODO Feature: Votos no??
                            model: Usuario,
                            as: 'duenio',
                            include: {
                                model: Perfil,
                                attributes: ['ID', 'nombre']
                            },
                            attributes: ['DNI', 'nombre']
                        }
                    ]
                },
                {
                    model:EtiquetasPregunta
                    ,required: true
                    ,as: 'etiquetas'
                    ,include:{
                        model: Etiqueta
                    }
                    ,separate:true
                },
                
            ],//TODO Refactor: aplicar dry
            attributes:
                {
                    include:
                    [[
                        sequelize.literal('(SELECT COUNT(*) FROM respuesta WHERE respuesta.preguntaID = pregunta.ID)'),
                        'respuestasCount'
                    ]]
        }   
            ,
            where: {
                '$post.duenio.DNI$': +duenioID
            },
            order:[[Post,'fecha','DESC']],
            limit:PAGINACION.resultadosPorPagina,
            offset:(+pagina)*PAGINACION.resultadosPorPagina,

            // ,raw:true,nest:true
        })
	}else{
		let opciones={
			include:[Post],
			limit:PAGINACION.resultadosPorPagina,
			offset:(+pagina)*PAGINACION.resultadosPorPagina,
			subQuery:false
		};
        opciones.attributes = {
            include: [
                [
                    sequelize.literal('(SELECT COUNT(*) FROM respuesta WHERE respuesta.preguntaID = pregunta.ID)'),
                    'respuestasCount'
                ]
            ]
        };
    

		let filtraEtiquetas=false
            ,filtrarTexto=false;


		if(filtrar){

			if(filtrar.texto){
				opciones.where=Sequelize.or(
					Sequelize.literal('match(post.cuerpo) against ("'+filtrar.texto+'*"  IN BOOLEAN MODE)'),
					Sequelize.literal('match(titulo) against ("'+filtrar.texto+'*"  IN BOOLEAN MODE)')	
				);
                filtrarTexto=true
			}
			
			if(filtrar.etiquetas){
				// TODO Feature: Ver cómo traer las otras etiqeutas, además de las usadas en el filtro
				opciones.include.push({
                    model:EtiquetasPregunta
                    ,required: true
                    ,as: 'etiquetas'
                    ,include:{
                        model: Etiqueta,
                        as:'etiquetas',
                        where: {
                            ID:filtrar.etiquetas
                        }
                    }
                    ,separate:true
				});
				filtraEtiquetas=true;
			}
		}

        if(filtrarTexto){
            opciones.order=[Sequelize.literal('(match(post.cuerpo) against ("'+filtrar.texto+'*"  IN BOOLEAN MODE)+ match(titulo) against ("'+filtrar.texto+'*"  IN BOOLEAN MODE)) desc, fecha desc')]
            // TODO Feature: Ordenar por match
        }else opciones.order=[[Post,'fecha','DESC']];

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
		if(formatoCorto){
			// Agregar raw, y eso para que sean pocos datos. No hace falta cruzar con casi nada.
			// Otra opción es manipular lo que se obtiene para mandar objetos reducidos.
			opciones.attributes=['ID','titulo'];
		}else{
			// * Datos propios
			opciones.include[0]={ // ! include[0] es Post por default
				model:Post
				,include:[
					{
						model:Voto
                        ,separate:true
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
			// opciones.include.push(
			// 	// TODO Feature: Ordenar respuesta y tener una sola. Resolver primero en el caso de preguntas por usuario y después traer acá (es más cómodo trabajar allá)
			// 	{
			// 		model:Respuesta
			// 		,as:'respuestas'
            //         ,separate:true
			// 		,include:
            //         {
            //             model: Post,
            //             include: [
            //                 {
            //                     model:Usuario
            //                     ,as:'duenio'
            //                     ,include:{
            //                         model:Perfil
            //                         ,attributes:['ID','nombre']
            //                     }
            //                     ,attributes:['DNI','nombre']
            //                 },
            //                 {
            //                     model:Voto,
            //                     as: 'votos',
            //                     //TODO Feature: encontrar manera de traer solo la suma
            //                 }
            //             ]
            //         }
			// 	}
			// );
			if(!filtraEtiquetas){
				opciones.include.push({
                    model:EtiquetasPregunta
                    ,include:Etiqueta/* {
                        model:Etiqueta,
                        as:'etiqueta'
                    } */, 
                    as: 'etiquetas'
                    ,separate:true
                })
			}
		}

        // TODO Feature: Ordenar respuestas por relevancia, y por fecha
		/* if(filtrar){ // && !formatoCorto ){
			// Búsqueda: Agregar relevancia por votaciones y respuestas... Desarrollar algoritmo de puntaje teniendo en cuenta todo.
			// opciones.attributes={include:[Sequelize.literal('(SELECT COUNT(r.*)*2 FROM respuestas ON )'),'puntuacion']}
		}else{
			opciones.order=[[Post,'fecha','DESC']];
		} */
        return Pregunta.findAll(opciones);
    }
}


Post.pagina=({pagina=0, DNI}={})=>{
    return Post.findAll({
		include: [
			  { model: Usuario, as: 'duenio'}, 
			  { model: Respuesta, as: 'respuesta', 
			  include: [
				{ 
				  model: Pregunta, 
				  as: 'pregunta', 
				  attributes: ['ID', 'titulo'],
				  include:[
					  {
						  model:EtiquetasPregunta
						  ,required: true
						  ,as: 'etiquetas'
						  ,include:{
							  model: Etiqueta
						  }
						  ,separate:true
					  }
				  ]
			  } // *Include Pregunta in Respuesta
			  ],
				required: false,
				attributes: ['ID', 'preguntaID'] 
			  },  
			  { 
				model: Pregunta, 
				as: 'pregunta', 
				required: false, 
				attributes: ['ID', 'titulo'] ,
				include:[
					{
						model:EtiquetasPregunta
						,required: true
						,as: 'etiquetas'
						,include:{
							model: Etiqueta
						}
						,separate:true
					}
				]
			} 
		],
        where: {
            '$post.duenioDNI$': +DNI
        },
        order:[['fecha','DESC']],
        limit:PAGINACION.resultadosPorPagina,
        offset:(+pagina)*PAGINACION.resultadosPorPagina,
	})

}

Respuesta.pagina=({pagina=0, DNI}={})=>{
    return Pregunta.findAll({
        // TODO Feature: try subQUery:false again and separate: true
        include: [
            {
                model: Post,
                include: [
                    {
                        model: Usuario,
                        as: 'duenio',
                        include: {
                            model: Perfil,
                        },
                    },
                    
                ],
            },
            {
                model:Respuesta,
                as :'respuestas',
                required:true,
                include:{
                    model: Post,
                    include: [
                        {
                            model: Usuario,
                            as: 'duenio',
                            include: {
                                model: Perfil,
                            },
                        },
                        {
                            model:Voto
                            ,separate:true
                            ,include:{model:Usuario,as:'votante'}
                        }
                    ],
                }
            },
            {
                model:EtiquetasPregunta
                ,required: true
                ,as: 'etiquetas'
                ,include:{
                    model: Etiqueta
                }
                ,separate:true
            },
            
        ],//TODO Refactor: aplicar dry
        attributes:
            {
                include:
                [[
                    sequelize.literal('(SELECT COUNT(*) FROM respuesta WHERE respuesta.preguntaID = pregunta.ID)'),
                    'respuestasCount'
                ]]
        },
        where:{
            '$respuestas.post.duenio.DNI$':DNI
        },
        order:[[Post, 'fecha','DESC']],
        // ,raw:true,nest:true
    })
}


Pregunta.hasOne(Post,{
    constraints:false,
    foreignKey:'ID'
})

Post.belongsTo(Pregunta,{
    constraints:false,
    as:'pregunta',
    foreignKey:'ID'
})

Pregunta.hasMany(Respuesta,{
    as:'respuestas',
    constraints:false,
    foreignKey:'preguntaID'
})

Respuesta.belongsTo(Pregunta,{
    constraints:false,
    as:'pregunta'
});

const Etiqueta = sequelize.define('etiqueta',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion:{
        type: DataTypes.STRING,
        allowNull:false
    }
})

const EtiquetasPregunta = sequelize.define('etiquetasPregunta',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

Pregunta.hasMany(EtiquetasPregunta,{
    as:'etiquetas'
    ,constraints:false
})
/* 
Etiqueta.hasMany(EtiquetasPregunta,{
    // as:'etiqueta',
    constraints:false
    ,foreignKey:'etiquetumID'
});
 */
EtiquetasPregunta.belongsTo(Etiqueta,{constraints:false});

/* 
Etiqueta.hasMany(EtiquetasPregunta,{
    as:'preguntas'
    ,constraints:false
}) */

/* Pregunta.belongsToMany(Etiqueta, {
    as:'etiquetas',
    through: EtiquetasPregunta,
    constraints:false
}); */

/* // TODO Refactor: Quizá ni siquiera haga falta, es raro que se haga Etiqueta.pregunta/s
 Etiqueta.belongsToMany(Pregunta, {
    as:'preguntas',
    through: EtiquetasPregunta,
    constraints:false 
}); */ 


const Categoria = sequelize.define('categoria',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion:{
        type:DataTypes.STRING,
        allowNull: false
    },
    color:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

Categoria.hasMany(Etiqueta,{
    constraints:false,
    foreignKey:'categoriaID'
});

Etiqueta.belongsTo(Categoria,{
    as:'categoria',
    constraints:false
});

const SuscripcionesEtiqueta = sequelize.define('suscripcionesEtiqueta',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    createdAt:{
        field:'fecha',
        type:DataTypes.DATE,
    },
    fecha_baja:{
        type:DataTypes.DATE,
    }
})

// TODO Feature: Ver si no se puede hacer algo como un Many to Many. Tanto acá como en otros como el voto, el reporte...
/*
Usuario.hasMany(SuscripcionesEtiqueta,{
    as:'etiquetasSuscriptas',
    constraints:false,
    foreignKey:'suscriptoDNI'
});

Etiqueta.hasMany(SuscripcionesEtiqueta,{
    as:'suscriptos',
    constraints:false,
    foreignKey:'etiquetaID'
})
*/

Usuario.belongsToMany(Etiqueta, { 
    through: SuscripcionesEtiqueta,
    constraints:false,
    as: 'etiquetasSuscriptas',
    foreignKey:'suscriptoDNI'
});

Etiqueta.belongsToMany(Usuario, { 
    through: SuscripcionesEtiqueta,
    constraints:false,
    as:'suscriptos',
    foreignKey:'etiquetaID'
});

const SuscripcionesPregunta = sequelize.define('suscripcionesPregunta',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    createdAt:{
        field:'fecha',
        type:DataTypes.DATE,
    },
    fecha_baja:{
        type:DataTypes.DATE,
    }
})

// TODO Refactor: alias más lindos

Usuario.hasMany(SuscripcionesPregunta,{
    as:'preguntasSuscriptas',
    constraints:false,
    foreignKey:'suscriptoDNI'
});

Pregunta.hasMany(SuscripcionesPregunta,{
    as:'suscriptos',
    constraints:false,
    foreignKey:'preguntaID'
})

Usuario.belongsToMany(Pregunta, { 
    through: SuscripcionesPregunta,
    constraints:false,
    as: 'usuariosSuscriptos',
    foreignKey:'suscriptoDNI'
});

Pregunta.belongsToMany(Usuario, { 
    through: SuscripcionesPregunta,
    constraints:false,
    as:'suscriptas',
    foreignKey:'preguntaID'
});

const Carrera = sequelize.define('carrera',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull:false
    }
})

const CarrerasUsuario = sequelize.define('carrerasUsuario',{
    Legajo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false
    }
})

Usuario.belongsToMany(Carrera, { 
    through: CarrerasUsuario,
    constraints:false
});

Carrera.belongsToMany(Usuario, { 
    through: CarrerasUsuario,
    constraints:false
});

//Post.sync({force:true});
//Pregunta.sync({force:true});

/*Post.create({
    cuerpo:"hola"
});
Post.create({
    cuerpo:"hola2"
});
Post.create({
    cuerpo:"hola3"
});
Post.create({
    cuerpo:"hola4"
});
Post.create({
    cuerpo:"hola5"
});
*/
/*
Pregunta.create({
    ID:1,
    titulo:"chau"
});
Pregunta.create({
    ID:2,
    titulo:"chau2"
});
Pregunta.create({
    ID:3,
    titulo:"chau3"
});
Pregunta.create({
    ID:4,
    titulo:"chau4"
});
Pregunta.create({
    ID:5,
    titulo:"chau5"
});
*/

/*sequelize.sync({}).then(()=>{
    Pregunta.findAll({raw:true,
        plain:true,
        nest:true,
    include:Post}).then(pregunta=>console.log(pregunta.cuerpo));
})*/


// sequelize.sync({alter:true});

export {SuscripcionesPregunta, Usuario, Bloqueo, ReportesUsuario, Post, Notificacion, Voto, TipoReporte, ReportePost, Perfil, Permiso, PerfilesPermiso, Respuesta, Pregunta, Etiqueta, EtiquetasPregunta, Categoria, SuscripcionesEtiqueta}
