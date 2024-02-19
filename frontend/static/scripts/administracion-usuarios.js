import { PantallaAdministracionUsuarios } from "../pantallas/administracion-usuarios.js";

let pagina= PantallaAdministracionUsuarios(location.pathname, {usuario:window.usuarioActual});
pagina.partes[0]/* ! Tabla */.iniciar();