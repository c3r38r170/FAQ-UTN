import * as express from "express";
const router = express.Router();
import {Pagina,Busqueda} from '../frontend/componentes.js';

// preguntas
router.get('/pregunta/:id',(req,res)=>{
	
})

// respuestas

// usuarios

router.get('/',(req,res)=>{
	let pagina=new Pagina({
		ruta:req.path
		,titulo:'Inicio'
		,sesion:req.session.usuario
	});
	pagina.partes.push(new Busqueda());
	res.send(pagina.render());
})
router.get('/perfil/:id?',(req,res)=>{
	let pagina=new Pagina({
		ruta:req.path
		,titulo:'Perfil'
		,sesion:req.session.usuario
	});
	res.send(pagina.render());
})

export {router};