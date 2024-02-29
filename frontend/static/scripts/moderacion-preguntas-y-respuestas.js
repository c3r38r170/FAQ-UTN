import { PantallaModeracionPosts } from "../pantallas/moderacion-posts.js";

let pagina = PantallaModeracionPosts(location.pathname, {
  usuario: window.usuarioActual
});

let tabla = pagina.partes[0];
tabla /* ! Tabla */
  .iniciar();