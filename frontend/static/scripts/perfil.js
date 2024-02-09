import { PaginaPerfil } from "../pantallas/perfil.js";

let usuario=window.usuarioActual;
let pagina= PaginaPerfil(location.pathname, {usuario}, {DNI:usuario.DNI});
pagina.partes[2]/* ! DesplazamientoInfinito */.pagina=2;