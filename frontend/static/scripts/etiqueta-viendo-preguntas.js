import { PantallaEtiquetaPreguntas } from "../pantallas/pantalla-etiquetas-pregunta.js";

let pagina=PantallaEtiquetaPreguntas(location.pathname,{
    usuario: window.usuarioActual,
  }, "?etiquetas=true&etiquetaID="+location.pathname.split('/')[2]);
pagina.partes[1]/* ! DesplazamientoInfinito */.pagina=2;