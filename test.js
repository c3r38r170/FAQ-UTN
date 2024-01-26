import axios from 'axios';
import assert from 'assert';

const baseURL = 'http://localhost:8080'; // Update the port or base URL according to your API

let sessionCookie = null;

const makeRequest = async (method, url, data = {}, headers = {}) => {
  try {
    const response = await axios({
      method,
      url: baseURL + url,
      data,
      headers: {
        ...headers,
        Cookie: sessionCookie,
      },
    });

    if (response.headers['set-cookie']) {
      sessionCookie = response.headers['set-cookie'][0].split(';')[0];
    }

    return response;
  } catch (error) {
    return error.response || { status: 500 }; // Default status code if response is undefined
  }
};

describe('Express API Tests', () => {
  // Test: User Login (Expecting 200)
  it('post - login200', async () => {
    const response = await makeRequest('post', '/api/sesion', {
      DNI: '41097334',
      contrasenia: '12345678',
    });

    assert.strictEqual(response.status, 200);
  });

  // Test: User Report (Expecting 404)
  it('post - usuarioReporte404', async () => {
    const response = await makeRequest('post', '/api/usuario/4/reporte');

    assert.strictEqual(response.status, 404);
  });

  // Test: User Report (Expecting 201)
  it('post - usuarioReporte201', async () => {
    const response = await makeRequest('post', '/api/usuario/41097335/reporte');

    assert.strictEqual(response.status, 201);
  });

  // Test: Answer Report (Expecting 404)
  it('post - reporteRespuesta404', async () => {
    const response = await makeRequest('post', '/api/respuesta/9999999999999/reporte', {
      tipo: 1,
    });

    assert.strictEqual(response.status, 404);
  });

  // Test: Question Report (Expecting 404)
  it('post - reportePregunta404', async () => {
    const response = await makeRequest('post', '/api/pregunta/9999999999999/reporte', {
      tipo: 1,
    });

    assert.strictEqual(response.status, 404);
  });

  // Test: Answer Report (Expecting 201)
  it('post - reporteRespuesta201', async () => {
    const response = await makeRequest('post', '/api/respuesta/23/reporte', {
      tipo: 1,
    });

    assert.strictEqual(response.status, 201);
  });

  // Test: Question Report (Expecting 201)
  it('post - reportePregunta201', async () => {
    const response = await makeRequest('post', '/api/pregunta/9/reporte', {
      tipo: 1,
    });

    assert.strictEqual(response.status, 201);
  });

  // Test: Question without Report (Expecting 201)
  it('post - pregunta200SinReporte', async () => {
    const response = await makeRequest('post', '/api/pregunta', {
      titulo: '¿Que días se rinde Análisis Matemático?',
      cuerpo: 'Así me organizo mejor.'
    });

    assert.strictEqual(response.status, 201);
  });

  // Test: Question (Expecting 400)
  it('post - pregunta400', async () => {
    const response = await makeRequest('post', '/api/pregunta', {
      titulo: '¿Que días se rinde Análisis Matemático?',
      cuerpo: 'hijos de puta',
    });

    assert.strictEqual(response.status, 400);
  });

  // Test: Update Question (Expecting 200)
  it('patch - pregunta200', async () => {
    const response = await makeRequest('patch', '/api/pregunta', {
      ID: 9,
      cuerpo: 'probando',
    });

    assert.strictEqual(response.status, 200);
  });

  // Test: Update Question (Expecting 401)
  it('patch - pregunta401', async () => {
    const response = await makeRequest('patch', '/api/pregunta', {
      ID: 3,
      cuerpo: 'probando',
    });

    assert.strictEqual(response.status, 401);
  });

  // Test: Update Question (Expecting 404)
  it('patch - pregunta404', async () => {
    const response = await makeRequest('patch', '/api/pregunta', {
      ID: 2,
      cuerpo: 'probando',
    });

    assert.strictEqual(response.status, 404);
  });

  // Test: Get Question (Expecting 200)
  it('get - pregunta200', async () => {
    const response = await makeRequest('get', '/api/pregunta', {
      cuerpo: 'organizo',
      pagina: 0,
    });

    assert.strictEqual(response.status, 200);
  });

  // Test: Update Question (Expecting 400)
  it('patch - pregunta400', async () => {
    const response = await makeRequest('patch', '/api/pregunta', {
      ID: '9',
      cuerpo: 'pelados puttos',
    });

    assert.strictEqual(response.status, 400);
  });

  // Test: Create Answer (Expecting 404)
  it('post - respuesta404', async () => {
    const response = await makeRequest('post', '/api/respuesta', {
      IDPregunta: 2,
      cuerpo: 'hola',
    });

    assert.strictEqual(response.status, 404);
  });

  // Test: Create Answer (Expecting 404)
  it('post - respuesta404', async () => {
    const response = await makeRequest('post', '/api/respuesta', {
      IDPregunta: 2,
      cuerpo: 'hola',
    });

    assert.strictEqual(response.status, 404);
  });

  // Test: Create Answer (Expecting 400)
  it('post - respuesta400', async () => {
    const response = await makeRequest('post', '/api/respuesta', {
      IDPregunta: 3,
      cuerpo: 'no te anotes con x es un hijo de puta',
    });

    assert.strictEqual(response.status, 400);
  });

  // Test: Create Answer (Expecting 201)
  it('post - respuesta201', async () => {
    const response = await makeRequest('post', '/api/respuesta', {
      IDPregunta: 3,
      cuerpo: 'Los lunes a las 15 horas',
    });

    assert.strictEqual(response.status, 201);
  });

  // Test: Update Answer (Expecting 400)
  it('patch - respuesta400', async () => {
    const response = await makeRequest('patch', '/api/respuesta', {
      ID: 23,
      cuerpo: 'quiero drogas',
    });

    assert.strictEqual(response.status, 400);
  });

  // Test: Update Answer (Expecting 404)
  it('patch - respuesta404', async () => {
    const response = await makeRequest('patch', '/api/respuesta', {
      ID: 1,
      cuerpo: 'holaaaaaaaaaa',
    });

    assert.strictEqual(response.status, 404);
  });

  // Test: Update Answer (Expecting 401)
  it('patch - respuesta401', async () => {
    const response = await makeRequest('patch', '/api/respuesta', {
      ID: 28,
      cuerpo: 'holaaaaaaaaaa',
    });

    assert.strictEqual(response.status, 401);
  });

  // Test: Update Answer (Expecting 200)
  it('patch - respuesta200', async () => {
    const response = await makeRequest('patch', '/api/respuesta', {
      ID: 23,
      cuerpo: 'holaaaaaaaaaa',
    });

    assert.strictEqual(response.status, 200);
  });

  it('post - Suscripcion Etiqueta 201', async () => {
    const response = await makeRequest('post', '/api/etiqueta/2/suscripcion');

    assert.strictEqual(response.status, 201);
  });

  it('post - Suscripcion Pregunta 404', async () => {
    const response = await makeRequest('post', '/api/pregunta/999999999999/suscripcion');

    assert.strictEqual(response.status, 404);
  });

  it('post - Suscripcion Pregunta 201', async () => {
    const response = await makeRequest('post', '/api/pregunta/9/suscripcion');

    assert.strictEqual(response.status, 201);
  });

  it('post - Suscripcion Pregunta 204', async () => {
    const response = await makeRequest('post', '/api/pregunta/9/suscripcion');

    assert.strictEqual(response.status, 204);
  });

  it('post - Suscripcion Etiqueta 404', async () => {
    const response = await makeRequest('post', '/api/etiqueta/1/suscripcion');

    assert.strictEqual(response.status, 404);
  });


  it('post - Suscripcion Etiqueta 204', async () => {
    const response = await makeRequest('post', '/api/etiqueta/2/suscripcion');

    assert.strictEqual(response.status, 204);
  });

  it('post - Login 404', async () => {
    const response = await makeRequest('post', '/api/sesion', {
      DNI: '1',
      contrasenia: '12345679',
    });

    assert.strictEqual(response.status, 404);
  });

  it('post - Login 401', async () => {
    const response = await makeRequest('post', '/api/sesion', {
      DNI: '41097334',
      contrasenia: '12345679',
    });

    assert.strictEqual(response.status, 401);
  });

  it('post - Login 200', async () => {
    const response = await makeRequest('post', '/api/sesion', {
      DNI: '41097334',
      contrasenia: '12345678',
    });

    assert.strictEqual(response.status, 200);
  });

  it('post - Crear Usuario 400', async () => {
    const response = await makeRequest('post', '/api/usuario', {
      nombre: 'Matias Matias',
      DNI: '41097335',
      correo: 'matiasbais1998@gmail.com',
      contrasenia: '12345678',
    });

    assert.strictEqual(response.status, 400);
  });

  it('post - Resetear Contrasenia 200', async () => {
    const response = await makeRequest('post', '/api/usuario/41097335/contrasenia');

    assert.strictEqual(response.status, 200);
  });

  it('patch - Cambiar Contrasenia 200', async () => {
    const response = await makeRequest('patch', '/api/usuario', {
      contrasenia: '12345678',
    });

    assert.strictEqual(response.status, 200);
  });

  it('get - Buscar Usuario 200', async () => {
    const response = await makeRequest('get', '/api/usuario', {
      nombre: 'Matias',
      pagina: 0,
    });

    assert.strictEqual(response.status, 200);
  });

  it('get - Buscar Usuario 404', async () => {
    const response = await makeRequest('get', '/api/usuario', {
      nombre: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      pagina: 0,
    });

    assert.strictEqual(response.status, 404);
  });

  it('delete - Log Out 200', async () => {
    const response = await makeRequest('delete', '/api/sesion');

    assert.strictEqual(response.status, 200);
  });

});
