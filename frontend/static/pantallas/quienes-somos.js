import { Pagina, Modal, ComponenteLiteral } from "../componentes/todos.js";

function crearPagina(ruta,usuario) {
  let modal = new Modal("General", "modal-general");
  return new Pagina({
		titulo: "FAQ UTN",
    sesion: usuario,
		ruta,
    partes: [
			modal
			,new ComponenteLiteral(()=>
				`El proyecto "<b>FAQ UTN</b>" tiene como objetivo crear una plataforma que pueda reunir toda la información relevante de la <b>Universidad Tecnológica Nacional (UTN)</b> en un solo lugar, para que los usuarios (principalmente <b>estudiantes</b>) puedan acceder a ella fácilmente y obtener información precisa y actualizada sobre cualquier tema relacionado con esta.
				El proyecto surge a raíz de la existencia de numerosos canales no oficiales donde se distribuye información sobre la UTN, lo que puede generar confusión y desinformación entre los estudiantes. Además, muchos nuevos estudiantes buscan consejo en estudiantes que ya pasaron por diferentes situaciones, lo que puede llevar a la transmisión de información equivocada o desactualizada.
				La idea es ofrecer un espacio donde recopilar <b>toda la información de interés</b> para los estudiantes, desde <u>información académica</u> (carreras, planes de estudio, horarios, fechas de exámenes, etc.) hasta <u>información sobre servicios y recursos</u> de la universidad (biblioteca, laboratorios, deportes, becas, etc.).
				El objetivo final es facilitar la vida de los estudiantes, ofreciéndoles una <b>fuente confiable y centralizada de información</b> sobre la UTN, que les permita resolver dudas y tomar decisiones informadas de manera rápida y sencilla.`
					.split("\n").reduce((acc,p)=>acc+`<p>${p.trim()}</p>`,''))
		],
  });
}

export { crearPagina as PantallaQuienesSomos };
