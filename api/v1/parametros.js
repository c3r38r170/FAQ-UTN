//Para obtener los parametros
import * as express from "express";
import {
    Parametro,
  } from "./model.js";


let PAGINACION = {
    resultadosPorPagina: 10,
  };
  
  let rechazaPost = 40;
  let reportaPost = 70;
  let modera = false;
  
  Parametro.findAll().then((ps) => {
    ps.forEach((p) => {
      if (p.ID == 1) PAGINACION.resultadosPorPagina = parseInt(p.valor);
      if (p.ID == 2) modera = p.valor == "1";
      if (p.ID == 3) rechazaPost = parseInt(p.valor);
      if (p.ID == 4) reportaPost = parseInt(p.valor);
    });
  });
  function getPaginacion() {
    return PAGINACION;
  }
  
  function setResultadosPorPagina(nuevoValor) {
    PAGINACION.resultadosPorPagina = nuevoValor;
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