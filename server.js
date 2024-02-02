import express from 'express';
import cors from 'cors';
import session from 'express-session';


var app = express();

app.use(session({
	secret:'👻',
    resave:true,
    saveUninitialized: false
}));

app.use(express.json());
app.use(express.static('frontend/static'));

app.use(cors({
	origin: true,
	credentials: true
}));

/* app.use((req,res,next) => {
	if(req.session.usuarioID){
	}else if([
			'/api/usuarios/' // Registro.
			,'/api/usuarios/ingresar'
			,'/api/usuarios/salir'
			// TODO Feature: Restringir verbo tambien
	].includes(req.path))
			next();
	else res.status(401).send('Inicie sesión.');
}) */

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