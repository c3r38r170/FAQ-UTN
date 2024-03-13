//Para obtener los parametros
let PAGINACION = {
    resultadosPorPagina: 10,
  };
  
  let rechazaPost = 40;
  let reportaPost = 70;
  let modera = false;
  
  function getPaginacion() {
    return PAGINACION;
  }
  
  function setResultadosPorPagina(nuevoValor) {
    PAGINACION.resultadosPorPagina = parseInt(nuevoValor);
  }
  
  // Funciones para obtener y establecer el valor de rechazaPost
  function getRechazaPost() {
    return rechazaPost;
  }
  
  function setRechazaPost(nuevoValor) {
    rechazaPost = nuevoValor;
  }
  
  // Funciones para obtener y establecer el valor de reportaPost
  function getReportaPost() {
    return reportaPost;
  }
  
  function setReportaPost(nuevoValor) {
    reportaPost = nuevoValor;
  }
  
  // Funciones para obtener y establecer el valor de modera
  function getModera() {
    return modera;
  }
  
  function setModera(nuevoValor) {
    modera = nuevoValor;
  }

  export {getModera, getPaginacion, getRechazaPost, getReportaPost, setModera, setRechazaPost, setReportaPost, setResultadosPorPagina}