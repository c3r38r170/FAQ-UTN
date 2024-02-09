import { PaginaPerfil } from "../pantallas/perfil.js";

let pagina= PaginaPerfil(location.pathname, {usuario:window.usuarioActual}, {DNI:location.pathname.split('/')[2]});
pagina.partes[2]/* ! DesplazamientoInfinito */.pagina=2;