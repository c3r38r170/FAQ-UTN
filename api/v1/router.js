import * as express from "express";
import * as bcrypt from "bcrypt";
const router = express.Router();
import {Usuario,Pregunta} from '../api/v1/model.js';

// TODO Refactor: ¿Sacar y poner en models.js? Así el modelo se encarga de la paginación, y a los controladores no les importa.
const PAGINACION={
	resultadosPorPagina:10
}

// sesiones

router.post('/sesion', function(req, res) {
	let usuario;

	Usuario.find({
		where:{DNI:req.body.DNI}
		, raw:true,
		plain:true
		,include:{
			all:true
			// TODO Feature: Ver si esto no mata a todo.
		}
	})
		.then(usu=>{
			if(!usu){
				res.status(404).send('El DNI no se encuentra registrado.');
				return;
			}

			usuario=usu;
			return bcrypt.compare(req.body.contrasenia,usu.contrasenia);
		})
		.then(coinciden=>{
			if(coinciden){
				// TODO Feature: ver si raw:true funciona
				// TODO Refactor: plain?
				// TODO Feature: Refrescar la sesion cada vez que cambia algo (CUD); ¿hacer una funcion que repita el find + =
				req.session.usuario=usuario;
			}else{
				res.status(401).send('Contraseña incorrecta.');
			}
		})
		.catch(err=>{
			// TODO mensaje representativo
			res.status(500).send(err);
		})
})
router.delete('/sesion', function(req, res) {
	req.session.destroy();
	res.status(200).send()
})

// usuario'

router.post('/registro', function(req,res){
    Usuario.find({
		where:{DNI:req.body.DNI}
		, raw:true,
		plain:true
	})
    .then(usu=>{
        if(!usu){
            Usuario.create({
                nombre: body.req.nombre,
                DNI: body.req.DNI,
                correo: body.req.correo,
                contrasenia: body.req.contrasenia
            })
            res.status(200).send('Registro exitoso');
            return;
        }
        res.status(400).send('El Usuario ya se encuentra registrado');
    })
    .catch(err=>{
        res.status(500).send(err);
    })        
});


// // recuperación de contraseña

//Enviar un correo

router.post('/recuperarContrasenia',function(req,res){

    function generarContrasenia() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }

    Usuario.find({
		where:{DNI:req.body.DNI}
		, raw:true,
		plain:true
	})
    .then(usu=>{
        if(!usu){
            res.status(404).send('DNI inexistente')
            return;
        }
		let contraseniaNueva = generarContrasenia();
		usu.setDataValue('contrasenia', contraseniaNueva);

        //TODO mandar mail
        res.status(200).send('DNI encontrado, correo enviado')
    })
});

//Recibirs)eguntas recientes / revantes
router.get('/preguntas',(req,res)=>{
	// TODO Feature: Aceptar etiquetas y filtro de texto
	Pregunta.pagina(+req.pagina)
		.then(preguntas=>{
			res.status(200).send(preguntas);
		})
})



/* router.get('/',(req,res)=>{
}) */

export {router};