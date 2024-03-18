import { PaginaPerfil } from "../pantallas/perfil.js";

let pagina = PaginaPerfil(location.pathname, { usuario: window.usuarioActual }, { DNI: location.pathname.split('/')[2] });
let desplinf=pagina.partes[2];
desplinf.pagina=2;