import express from 'express';
import cors from 'cors';
import session from 'express-session';
import 'dotenv/config';
//import { CyclicSessionStore } from "@cyclic.sh/session-store";

var app = express();

//app.set("trust proxy", 1);
app.use(session({
	/*store: new CyclicSessionStore({
	  table: {
	    name: process.env.CYCLIC_DB,
	  }
	}),*/
	secret:'👻',
    resave:true,
    saveUninitialized: false,
    /*cookie: {secure: true, sameSite: "none", maxAge: 1000 * 60 * 60 * 48, httpOnly: true },
    proxy:true*/
}));

app.use(express.json());
app.use(express.static('frontend/static'));

app.use(cors({
	origin: true,
	credentials: true
}));

// TODO Refactor: Hacer DRY en la búsqueda de sesión y permisos


 app.use((req,res,next) => {
	const userRegex = /^\/api\/usuario\/\d+\/(foto|preguntas|posts|respuestas|contrasenia)$/;
	// * Esta exp. regular admite las /api/usuario/:DNI/... --> foto, preguntas, posts, respuestas o contrasenia
	
	if(req.session.usuario){
		next();
		return;
	}

	let rutasPermitidasPorMetodo={
		GET:()=>[
			'/',
			'/api/perfil', // get
			'/api/categoria', // get
			'/api/etiqueta', // get
			'/api/post/reporte', // get
			'/api/pregunta', // get 
			// "/api/usuario/:DNI/foto",
			req.path.match(userRegex), // * Todas las rutas que matchean con la expresion regular
			'/api/usuarios/salir'
		].some(route => route)
		,POST:()=>[
			'/api/sesion', // * Ingreso.
			'/api/usuario', // * Registro.
			req.path.match(userRegex),
		].includes(req.path)
		,DELETE:()=>req.path=='/api/sesion' // * Cerrado de sesión.
	}
	
	if(rutasPermitidasPorMetodo[req.method]()){
		next();
	}else res.status(401).send("Usuario no tiene sesión válida activa");

	// TODO Refactor: Hacer lo mismo para el frontend, con el SinPermiso.
}) 

const rutas = express.Router();

import {router as apiRouter} from './api/v1/router.js';
import {router as frontendRouter} from './frontend/router.js';

rutas.use('/api', apiRouter);
rutas.use('/', frontendRouter);

app.use(rutas);

var server = app.listen(process.env.PORT || 8080, function () {
	var port = server.address().port;
	console.log("App now running on port", port);
});
