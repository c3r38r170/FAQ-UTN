import { Pregunta, DesplazamientoInfinito,Tabla,Formulario, Encabezado, ChipValoracion, BotonSuscripcion, Notificacion } from '../componentes/todos.js';

// * Estos siempre vienen del backend, por lo que siempre están en /pantallas, así que nunca se pierden como lo incluido en paginaciones como notificaciones, preguntas, chips, respuestas...
window.DesplazamientoInfinito=DesplazamientoInfinito;
window.Tabla=Tabla;

// * Estos son estáticos, no necesitan instancias (y tampoco pueden usar, porque si vienen construidas del backend, no andan).
window.Formulario=Formulario;
window.Encabezado=Encabezado;
window.ChipValoracion=ChipValoracion;
window.BotonSuscripcion = BotonSuscripcion;
window.Notificacion=Notificacion;
window.Pregunta = Pregunta;