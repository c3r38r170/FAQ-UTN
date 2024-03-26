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
                { tipo: "solid", nombre: "circle fa-sm" },
                "/perfil"
              ),
              new EnlaceNavegacion(
                "Preguntas",
                { tipo: "solid", nombre: "circle fa-sm" },
                "/perfil/preguntas"
              ),
              new EnlaceNavegacion(
                "Respuestas",
                { tipo: "solid", nombre: "circle fa-sm" },
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
          ruta == "/moderacion/etiquetas" ||
          ruta == "/moderacion/posts-borrados"
        )
          moderacion = new EnlaceNavegacion(
            "Moderación",
            {
              tipo: "solid",
              nombre: "user-tie",
              subenlaces: [
                new EnlaceNavegacion(
                  "Usuarios",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/moderacion/usuarios"
                ),
                // TODO UX: El nav no está listo para esto. Además, según las opciones se agranda y se achica. Darle un formato consistente. Quizá achicar los laterales incluso.
                new EnlaceNavegacion(
                  "Preguntas <br>y Respuestas",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/moderacion/preguntas-y-respuestas"
                ),
                new EnlaceNavegacion(
                  "Posts Borrados",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/moderacion/posts-borrados"
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
          ruta == "/administracion/parametros" ||
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
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/administracion/perfiles"
                ), new EnlaceNavegacion(
                  "Usuarios",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/administracion/usuarios"
                ),
                new EnlaceNavegacion(
                  "Categorías",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/administracion/categorias"
                ),
                new EnlaceNavegacion(
                  "Etiquetas",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/administracion/etiquetas"
                ),
                new EnlaceNavegacion(
                  "Parámetros",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/administracion/parametros"
                )
              ],
            },
            "/administracion/perfiles"
          );
        }
        this.#enlaces.push(administracion);

        let estadisticasPosts = new EnlaceNavegacion("Estadísticas Posts",
          { tipo: "solid", nombre: "chart-simple" },
          "/estadisticas/posts/etiquetas"
        );
        if (
          ruta == "/estadisticas/posts" ||
          ruta == "/estadisticas/posts/etiquetas" ||
          ruta == "/estadisticas/posts/preguntasRelevantes" ||
          ruta == "/estadisticas/posts/postsNegativos"
        ) {
          estadisticasPosts = new EnlaceNavegacion(
            "Estadísticas Posts",
            {
              tipo: "solid",
              nombre: "chart-simple",
              subenlaces: [
                new EnlaceNavegacion(
                  "Etiquetas más usadas",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/estadisticas/posts/etiquetas"
                ),
                new EnlaceNavegacion(
                  "Preguntas más relevantes",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/estadisticas/posts/preguntasRelevantes"
                ),
                new EnlaceNavegacion(
                  "Posts con más votos negativos",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/estadisticas/posts/postsNegativos"
                ),
              ],
            },
            "/estadisticas/posts/etiquetas"
          );
        }
        this.#enlaces.push(estadisticasPosts);

        let estadisticasUsuarios = new EnlaceNavegacion("Estadísticas Usuarios",
          { tipo: "solid", nombre: "chart-simple" },
          "/estadisticas/usuarios/masRelevantes"
        );
        if (
          ruta == "/estadisticas/usuarios" ||
          ruta == "/estadisticas/usuarios/masRelevantes" /*||
          ruta == "/estadisticas/usuarios/masNegativos"*/
        ) {
          estadisticasUsuarios = new EnlaceNavegacion(
            "Estadísticas Usuarios",
            {
              tipo: "solid",
              nombre: "chart-simple",
              subenlaces: [
                new EnlaceNavegacion(
                  "Usuarios más Relevantes",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/estadisticas/usuarios/masRelevantes"
                ),
                /*new EnlaceNavegacion(
                  "Usuarios más negativos",
                  { tipo: "solid", nombre: "circle fa-sm" },
                  "/estadisticas/usuarios/masNegativos"
                ),*/
              ],
            },
            "/estadisticas/posts/etiquetas"
          );
        }
        this.#enlaces.push(estadisticasUsuarios);
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
                <i class="fa-${this.#icono.tipo} fa-${this.#icono.nombre
      } mr-1"></i>
                ${this.#texto}
            </a>
            ${subnavegacionHTML}
        </li>`;
  }
}

export { Navegacion, EnlaceNavegacion };
