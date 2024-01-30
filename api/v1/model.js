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
      }
     }
   );
   
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
        type: DataTypes.STRING,
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
    constraints:false
})

Post.hasMany(Notificacion, {
    as: 'notificaciones',
    constraints: false,
    foreignKey: 'postNotificadoID'
})

Notificacion.belongsTo(Post,{
    constraints:false
})

const Voto = sequelize.define('voto', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    valoracion:{
        type:DataTypes.BOOLEAN
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

Pregunta.pagina=(n=0,{filtro='',etiquetas=[]}={})=>{
    // TODO Feature: Implementar filtros
    // TODO Feature: quitar respuestas, dejar solo la más relevante  o no? Hacer por algún parámetro como "formato", para saber si mandar todo, solo la primera respuesta, o incluso solo el título y la ID (para las sugerencias)
    // TODO Feature: Ordenar respuestas por relevancia, y por fecha
	Pregunta.findAll({
        /* include:[
            {
                model:Respuesta
                ,separate:true
                ,order: [
                    ['createdAt', 'DESC']
                ]
            }
        ], */
		order:[
			[Post,'fecha_alta','DESC']
		]
		,limit:PAGINACION.resultadosPorPagina
		,offset:n*PAGINACION.resultadosPorPagina
	})
}

Pregunta.hasOne(Post,{
    constraints:false,
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

Pregunta.belongsToMany(Etiqueta, { 
    through: EtiquetasPregunta,
    constraints:false
});

 Etiqueta.belongsToMany(Pregunta, { 
    through: EtiquetasPregunta,
    constraints:false 
});


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
    as:'categoria',
    constraints:false,
    foreignKey:'categoriaID'
});

Etiqueta.belongsTo(Categoria,{
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

Usuario.hasMany(SuscripcionesEtiqueta,{
    as:'suscriptoAEtiqueta',
    constraints:false,
    foreignKey:'suscriptoDNI'
});

Etiqueta.hasMany(SuscripcionesEtiqueta,{
    as:'etiquetaSuscripta',
    constraints:false,
    foreignKey:'etiquetaID'
})

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

Usuario.hasMany(SuscripcionesPregunta,{
    as:'suscriptoAPregunta',
    constraints:false,
    foreignKey:'suscriptoDNI'
});

Pregunta.hasMany(SuscripcionesPregunta,{
    as:'preguntaSuscripta',
    constraints:false,
    foreignKey:'preguntaID'
})

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


//sequelize.sync({alter:true});

export {SuscripcionesPregunta, Usuario, Bloqueo, ReportesUsuario, Post, Notificacion, Voto, TipoReporte, ReportePost, Perfil, Permiso, PerfilesPermiso, Respuesta, Pregunta, Etiqueta, EtiquetasPregunta, Categoria, SuscripcionesEtiqueta}