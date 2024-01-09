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

const Token = sequelize.define('token', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
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



Token.belongsTo(Usuario,{
    as:'duenio',
    constraints :false,
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
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
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
    fecha:{
        type: DataTypes.DATE,
        allowNull : false
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
    fecha:{
        type: DataTypes.DATE,
        allowNull: false
    },
    cuerpo:{
        type: DataTypes.STRING,
        allowNull: false
    }
})

Usuario.hasMany(Post, {
    as: 'duenioPost',
    constraints:false,
    foreignKey:'duenioPostID'
})

Usuario.hasMany(Post, {
    as: 'eliminador',
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
    fecha:{
        type: DataTypes.DATE,
        allowNull:false
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

Permiso.hasMany(PerfilesPermiso,{
    as:'permiso',
    constraints:false,
    foreignKey:'permisoID'
})

Perfil.hasMany(PerfilesPermiso,{
    as:'perfill',
    constraints:false,
    foreignKey:'perfilID'
})

const Respuesta = sequelize.define('respuesta',{
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false
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
    }
})

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

Pregunta.hasMany(EtiquetasPregunta,{
    as:'preguntaa',
    constraints:false,
    foreignKey:'preguntaID'
})

Etiqueta.hasMany(EtiquetasPregunta,{
    as:'etiqueta',
    constraints:false,
    foreignKey:'etiquetaID'
})

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
    fecha:{
        type:DataTypes.DATE,
        allowNull:false
    },
    fecha_baja:{
        type:DataTypes.DATE,
    }
})

Usuario.hasMany(SuscripcionesEtiqueta,{
    as:'suscripto',
    constraints:false,
    foreignKey:'suscriptoID'
});

Etiqueta.hasMany(SuscripcionesEtiqueta,{
    as:'etiquetaa',
    constraints:false,
    foreignKey:'etiquetaID'
})


sequelize.sync();


export {Usuario, Bloqueo, Token, ReportesUsuario, Post, Notificacion, Voto, TipoReporte, ReportePost, Perfil, Permiso, PerfilesPermiso, Respuesta, Pregunta, Etiqueta, EtiquetasPregunta, Categoria, SuscripcionesEtiqueta}