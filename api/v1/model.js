import {Sequelize, DataTypes, VIRTUAL} from 'sequelize';

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
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    DNI: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
    createdAt:{
        field:'fecha',
        type:DataTypes.DATE,
    },
    motivo_desbloqueo: {
        type: DataTypes.STRING
    },
    fecha_desbloqueo: {
        type: DataTypes.DATEONLY
    }
});

Usuario.hasMany(Bloqueo, {
    as:'bloqueador',
    constraints :false,
    foreignKey: 'bloqueadorID',
});

Usuario.hasMany(Bloqueo, {
    as:'bloqueado',
    constraints :false,
    foreignKey: 'bloqueadoID',
});

Usuario.hasMany(Bloqueo, {
    as:'desbloqueador',
    constraints :false,
    foreignKey: 'desbloqueadorID',
});


const ReportesUsuario = sequelize.define('reporteUsuarios',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    createdAt:{
        field:'fecha',
        type:DataTypes.DATE,
    }
});

Usuario.hasMany(ReportesUsuario, {
    as: 'usuarioReportado',
    constraints: false,
    foreignKey: 'usuarioReportadoID'
});

Usuario.hasMany(ReportesUsuario, {
    as: 'usuarioReportante',
    constraints: false,
    foreignKey: 'usuarioReportanteID'
});

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
    foreignKey:'duenioPostID'
})

Usuario.hasMany(Post, {
    as: 'postsEliminados',
    constraints:false,
    foreignKey:'eliminadorID'
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
    as: 'notificado',
    constraints: false,
    foreignKey: 'notificadoID'
})

Post.hasMany(Notificacion, {
    as: 'postNotificado',
    constraints: false,
    foreignKey: 'postNotificadoID'
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
    as:'votante',
    constraints:false,
    foreignKey:'votanteID'
})

Post.hasMany(Voto,{
    as:'votado',
    constraints:false,
    foreignKey:'votadoID'
})

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
    as: 'tipo',
    constraints:false,
    foreignKey:'tipoID'
})

Usuario.hasMany(ReportePost,{
    as:'reportante',
    constraints:false,
    foreignKey: 'reportanteID'
})

Post.hasMany(ReportePost,{
    as:'reportado',
    constraints:false,
    foreignKey:'reportadoID'
})

const Perfil = sequelize.define('perfil',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

Perfil.hasMany(Usuario,{
    as:'perfil',
    constraints:false,
    foreignKey:'perfilID'
})

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
    constraints:false });

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

/* * Ejemplo de filtro por asociación de la documentación:
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
*/

Pregunta.pagina=(n=0,{filtro='',etiquetas=[]}={})=>{
    // TODO Feature: Implementar filtros
    // TODO Feature: quitar preguntas, dejar solo la más relevante
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
    as:'pregunta',
    constraints:false,
    foreignKey:'preguntaID'
})


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
})

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

Usuario.hasMany(SuscripcionesEtiqueta,{
    as:'suscriptoAEtiqueta',
    constraints:false,
    foreignKey:'suscriptoID'
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
    foreignKey:'suscriptoID'
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
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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


sequelize.sync({alter:true});

export {SuscripcionesPregunta, Usuario, Bloqueo, ReportesUsuario, Post, Notificacion, Voto, TipoReporte, ReportePost, Perfil, Permiso, PerfilesPermiso, Respuesta, Pregunta, Etiqueta, EtiquetasPregunta, Categoria, SuscripcionesEtiqueta}