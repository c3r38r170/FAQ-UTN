import { Pagina, Formulario, Modal } from "../componentes/todos.js";

//TODO: Feature: cambiar campos por apropiados y validar
//TODO: Feature: permisos
function crearPantalla(ruta, sesion, p) {
  let pagina = new Pagina({
    ruta: ruta,
    titulo: "",
    sesion: sesion,
  });
  const textoEntradas =
    "Resultados por página. <br><font size='2'>Especifíca cuantos resultados vienen en cada página. Con un número más alto tarda más en cargar, con un numero más bajo tarda menos a costa de mas peticiones al servidor. <br> Valor actual: " +
    p.EntradasPorPagina +
    " </font>";
  const textoModera =
    "Si se modera por IA. <br><font size='2'>Especifíca si al un usuario generar contenido, este pasa por un primer filtro por IA. <br> Valor actual: " +
    (p.ModerarIA ? "Sí" : "No") +
    " </font>";
  const textoSinReporte =
    "Margen de confianza para aceptar post. <br><font size='2'>Especifíca el porcentaje de confianza mínimo que debe tener la IA para aceptar un post. <br> Valor actual: " +
    p.ReportaPost +
    " </font>";
  const textoConReporte =
    "Margen de confianza para aceptar post con reporte. <br><font size='2'> Post con un nivel de confianza entre este valor y el para aceptar post serán aceptados pero automáticamente se creará un reporte. Con un valor menor serán rechazados. <br> Valor actual: " +
    p.RechazaPost +
    " </font>";

  let modal = new Modal("General", "modal-general");
  pagina.partes.push(modal);
  let form = new Formulario(
    "adminitrar-parametros",
    "/api/parametros",
    [
      //EntradasPorPagina	ModerarIA	RechazaPost	ReportaPost
      {
        name: "EntradasPorPagina",
        textoEtiqueta: textoEntradas,
        value: p.EntradasPorPagina,
      },
      {
        name: "ModerarIA",
        textoEtiqueta: textoModera,
        value: p.ModerarIA,
        type: "select",
      },
      {
        name: "ReportaPost",
        textoEtiqueta: textoSinReporte,
        value: p.ReportaPost,
      },
      {
        name: "RechazaPost",
        textoEtiqueta: textoConReporte,
        value: p.RechazaPost,
      },
    ],
    () => {
      //TODO: Feature: modal si rechaza
      window.location.reload();
    },
    {
      textoEnviar: "Guardar Parámetros",
      clasesBoton: "is-link is-rounded mt-3",
      verbo: "PATCH",
    }
  );
  pagina.partes.push(form);

  return pagina;
}

export { crearPantalla as PantallaAdministracionParametros };
