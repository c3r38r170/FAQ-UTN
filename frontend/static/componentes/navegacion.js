class Navegacion {
  //TODO REFACTOR
  // Comprobar sesion --> sino mostrar sólo búsqueda
  // Enviar objeto para mapear y renderizar el menú
  #enlaces = [];
  constructor(usuarioIdentificado, ruta) {
    if (!usuarioIdentificado) {
      // Visitante
      this.#enlaces = [
        new EnlaceNavegacion(
          "Buscar",
          { tipo: "solid", nombre: "magnifying-glass" },
          "/"
        ),
      ];
    } else {
      let perfil = new EnlaceNavegacion(
        "Perfil",
        { tipo: "regular", nombre: "user" },
        "/perfil"
      );

      //si esta en ruta perfil
      //TODO: Refactor para no crear el objeto principal otra vez
      if (
        ruta == "/perfil" ||
        ruta == "/perfil/preguntas" ||
        ruta == "/perfil/respuestas"
      )
        perfil = new EnlaceNavegacion(
          "Perfil",
          {
            tipo: "regular",
            nombre: "user",
            subenlaces: [
              new EnlaceNavegacion(
                "Información",
                { tipo: "solid", nombre: "circle" },
                "/perfil"
              ),
              new EnlaceNavegacion(
                "Preguntas",
                { tipo: "solid", nombre: "circle" },
                "/perfil/preguntas"
              ),
              new EnlaceNavegacion(
                "Respuestas",
                { tipo: "solid", nombre: "circle" },
                "/perfil/respuestas"
              ),
            ],
          },
          "/perfil"
        );

      this.#enlaces = [
        new EnlaceNavegacion(
          "Buscar",
          { tipo: "solid", nombre: "magnifying-glass" },
          "/"
        ),
        new EnlaceNavegacion(
          "Preguntar",
          { tipo: "solid", nombre: "plus" },
          "/pregunta"
        ),
        new EnlaceNavegacion(
          "Suscripciones",
          { tipo: "solid", nombre: "arrow-right" },
          "/suscripciones"
        ),
        perfil,
      ];
      if (usuarioIdentificado.perfil.permiso.ID >= 2) {
        //Enlances para moderadores
        let moderacion = new EnlaceNavegacion(
          "Moderación",
          { tipo: "solid", nombre: "user-tie" },
          "/moderacion/usuarios"
        );

        //si esta en ruta perfil
        //TODO: Refactor para no crear el objeto principal otra vez
        //TODO: esto es un placeholder
        if (
          ruta == "/moderacion/preguntas-y-respuestas" ||
          ruta == "/moderacion/usuarios" ||
          ruta == "/moderacion/etiquetas"
        )
          moderacion = new EnlaceNavegacion(
            "Moderación",
            {
              tipo: "solid",
              nombre: "user-tie",
              subenlaces: [
                new EnlaceNavegacion(
                  "Usuarios",
                  { tipo: "solid", nombre: "circle" },
                  "/moderacion/usuarios"
                ),
                // TODO UX: El nav no está listo para esto. Además, según las opciones se agranda y se achica. Darle un formato consistente. Quizá achicar los laterales incluso.
                new EnlaceNavegacion(
                  "Preguntas y Respuestas",
                  { tipo: "solid", nombre: "circle" },
                  "/moderacion/preguntas-y-respuestas"
                ),
              ],
            },
            "/moderacion/usuarios"
          );
        this.#enlaces.push(moderacion);
      }
      if (usuarioIdentificado.perfil.permiso.ID >= 3) {
        //TODO: Refactor para no crear el objeto principal otra vez
        //TODO: esto es un placeholder
        let administracion = new EnlaceNavegacion(
          "Administracion",
          { tipo: "solid", nombre: "user-secret" },
          "/administracion/perfiles"
        );

        if (
          ruta == "/administracion" ||
          ruta == "/administracion/perfiles" ||
          ruta == "/administracion/categorias" ||
          ruta == "/administracion/etiquetas" ||
          ruta == "/administracion/parametros"||
          ruta == "/administracion/usuarios"
        ) {
          administracion = new EnlaceNavegacion(
            "Administración",
            {
              tipo: "solid",
              nombre: "user-secret",
              subenlaces: [
                new EnlaceNavegacion(
                  "Perfiles",
                  { tipo: "solid", nombre: "circle" },
                  "/administracion/perfiles"
                ),new EnlaceNavegacion(
                  "Usuarios",
                  { tipo: "solid", nombre: "circle" },
                  "/administracion/usuarios"
                ),
                new EnlaceNavegacion(
                  "Categorías",
                  { tipo: "solid", nombre: "circle" },
                  "/administracion/categorias"
                ),
                new EnlaceNavegacion(
                  "Etiquetas",
                  { tipo: "solid", nombre: "circle" },
                  "/administracion/etiquetas"
                ),
                new EnlaceNavegacion(
                  "Parámetros",
                  { tipo: "solid", nombre: "circle" },
                  "/administracion/parametros"
                )
              ],
            },
            "/administracion/perfiles"
          );
        }
        this.#enlaces.push(administracion);
      }
    }
  }

  render() {
    return `<div class="navegacion-container">
                <ul class="navegacion">
                    ${this.#enlaces.reduce((s, en) => s + en.render(), "")}
                </ul>
            </div>`;
  }
}

class EnlaceNavegacion {
  #texto = "";
  #enlace = "";
  #icono = {
    tipo: "", // solid, regular, etc...
    nombre: "",
  };
  //TODO Refactor: por alguna razón los subenlances están adentro de tipo
  constructor(texto, icono, enlace = "") {
    this.#texto = texto;
    this.#icono = icono;
    this.#enlace = enlace;
  }

  render() {
    let subnavegacionHTML = "";
    if (this.#icono.subenlaces) {
      subnavegacionHTML = `<ul class="subnavegacion">
                ${this.#icono.subenlaces.reduce((s, en) => s + en.render(), "")}
            </ul>`;
    }

    return `<li>
            <a class="link" href="${this.#enlace}">
                <i class="fa-${this.#icono.tipo} fa-${
      this.#icono.nombre
    } mr-1"></i>
                ${this.#texto}
            </a>
            ${subnavegacionHTML}
        </li>`;
  }
}

export { Navegacion };
