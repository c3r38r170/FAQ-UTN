import { PantallaAdministracionParametros } from "../pantallas/administracion-parametros.js";
import { gEt, SqS } from "../libs/c3tools.js";

let pagina = PantallaAdministracionParametros(
  location.pathname,
  { usuario: window.usuarioActual },
  window.parametros
);
let modal = pagina.partes[0];
let tabla = pagina.partes[1];
tabla /* ! Tabla */
  .iniciar();

let modalElemento = gEt("modal-editar-parametros");
modalElemento.addEventListener("submit", () => {
  modalElemento.classList.remove("is-active");
});

//forms distintos para cada parametro, ya que piden distintos tipos de dato y/o maximos y minimos


gEt("administrar-parametros").onclick = (e) => {
  let boton = e.target;
  if (boton.type != "button") {
    return;
  }

  let ID = boton.id.split("-")[2];

  let indiceParametroElegido = tabla.entidades.findIndex(
    ({ ID: esteID }) => esteID == ID
  );
  let parametroElegido = tabla.entidades[indiceParametroElegido];

  //campos, son distintos dependiendo el parametro

  let campo={
    name: "valor",
    textoEtiqueta: "Valor:",
    type: "text",
    value: parametroElegido.valor,
    extra : ""
  }
  if(parametroElegido.ID==1){
    //Resultados por página
    campo.type = "number";
    campo.extra = 'max="20", min="4"'
  }else if(parametroElegido.ID==2){
    //Moderar por IA
    campo.type = "select";
  }else if(parametroElegido.ID==3){
    //Confianza para rechazar
    campo.type = "number";
    campo.extra = 'max="100", min="0"'
  }else if(parametroElegido.ID==4){
    //Confianza para reportar
    campo.type = "number";
    campo.extra = 'max="100", min="0"'
  }else 

  modal.titulo = "Editar " + parametroElegido.descripcion;
  modal.contenido = [
    new Formulario(
      "administracion-parametros-editar",
      `/api/parametro/${ID}`,
      [
        campo
      ],
      (txt, info) => {
        if (info.ok) {
          if (tabla.entidades[indiceParametroElegido].ID == ID) {
            // * Si se sigue en la misma página
            // ! Cubre ambos casos: Esperando respuesta, y tomado por sorpresa tras cambiar de página y volver.
            //TODO: cambiar los datos
            let tab = document.getElementById("administrar-parametros");
            if(parametroElegido.ID==2){
              tab.rows[indiceParametroElegido + 1].cells[1].innerText =
              JSON.parse(txt).valor==1?"Sí":"No";
            }else{
            tab.rows[indiceParametroElegido + 1].cells[1].innerText =
              JSON.parse(txt).valor;
            }
            parametroElegido.valor = JSON.parse(txt).valor;
          }
        } else {
          Swal.error(`Error ${info.codigo}: ${txt}`);
        }
      },
      {
        verbo: "PATCH",
        textoEnviar: "Editar parametro",
        clasesBoton: "is-link is-rounded mt-3",
      }
    ),
  ];

  modal.redibujar();
  try{
  let select = document.getElementsByName("valor")[0];

  var options = [
    {
      text: "Sí",
      value: 1,
      selected: 1 == parametroElegido.valor,
    },
    {
      text: "No",
      value:0,
      selected: 0 == parametroElegido.valor,
    },
  ];
  options.forEach((option) => {
    var o = document.createElement("option");
    o.text = option.text;
    o.value = option.value;
    if (option.selected) {
      o.selected = true;
    }
    select.add(o);
  });}catch{}

  modalElemento.classList.add("is-active");
};

