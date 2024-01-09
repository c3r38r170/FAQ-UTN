import * as express from "express";
import * as bcrypt from "bcrypt";
const router = express.Router();
import {Usuario,Pregunta} from '../api/v1/model.js';

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
				// TODO ver si raw:true funciona
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
	Pregunta.findAll({
		order:[
			[Post,'fecha_alta','DESC']
		]
		,limit:PAGINACION.resultadosPorPagina
		,offset:(+req.pagina)*PAGINACION.resultadosPorPagina
	})
		.then(preguntas=>{
			res.status(200).send(preguntas);
		})
})



/* router.get('/',(req,res)=>{
}) */

export {router};