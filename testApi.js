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

const testData = [
  { method: 'post', url: '/api/sesion', body: { DNI: '4385139', contrasenia: '4385139' }, expectedStatus: 200 },
  { method: 'get', url: '/api/usuario/', expectedStatus: 403 },
  { method: 'post', url: '/api/usuario/123/bloqueo', expectedStatus: 401 },
  { method: 'delete', url: '/api/usuario/123/bloqueo', expectedStatus: 401 },
  { method: 'patch', url: '/api/usuario/123', expectedStatus: 401 },
  { method: 'delete', url: '/api/sesion', expectedStatus: 200 },
  { method: 'post', url: '/api/sesion', body: { DNI: '78249503218', contrasenia: '78249503218' }, expectedStatus: 200 },
  { method: 'patch', url: '/api/usuario/123', expectedStatus: 401 },
  { method: 'post', url: '/api/sesion', body: { DNI: '4385139', contrasenia: '4385139' }, expectedStatus: 200 },
  { method: 'patch', url: '/api/notificacion', body: { ID: '2' }, expectedStatus: 403 },
  { method: 'get', url: '/api/parametro', expectedStatus: 401 },
  { method: 'patch', url: '/api/parametro/1', expectedStatus: 401 },
  { method: 'post', url: '/api/perfil/', expectedStatus: 401 },
  { method: 'patch', url: '/api/perfil/123', expectedStatus: 401 },
  { method: 'patch', url: '/api/perfil/123/activado', expectedStatus: 401 },
  { method: 'get', url: '/api/perfil/', expectedStatus: 401 },
  { method: 'post', url: '/api/post/272/valoracion', expectedStatus: 400 },
  { method: 'get', url: '/api/post/reporte', expectedStatus: 403 },
  { method: 'get', url: '/api/post/borrados', expectedStatus: 403 },
  { method: 'get', url: '/api/post/masNegativos', expectedStatus: 403 },
  { method: 'get', url: '/api/post/estadisticas', expectedStatus: 403 },
  { method: 'patch', url: '/api/pregunta', body: { ID: '290' }, expectedStatus: 403 },
  { method: 'put', url: '/api/pregunta/290', expectedStatus: 403 },
  { method: 'get', url: '/api/pregunta/masVotadas', expectedStatus: 403 },
  { method: 'post', url: '/api/categoria/', expectedStatus: 401 },
  { method: 'patch', url: '/api/categoria/1/activado', expectedStatus: 401 },
  { method: 'patch', url: '/api/categoria/1', expectedStatus: 401 },
  { method: 'post', url: '/api/etiqueta/', expectedStatus: 401 },
  { method: 'patch', url: '/api/etiqueta/1/activado', expectedStatus: 401 },
  { method: 'patch', url: '/api/etiqueta/1', expectedStatus: 401 },
  { method: 'get', url: '/api/etiqueta/masUsadas', expectedStatus: 401 }

];

describe('Express API Tests', () => {
  testData.forEach(data => {
    const bodyString = data.body ? JSON.stringify(data.body) : '';
    it(`${data.method.toUpperCase()} - ${data.url} ${bodyString ? 'with body ' + bodyString : ''}`, async () => {
      const response = await makeRequest(data.method, data.url, data.body);
      assert.strictEqual(response.status, data.expectedStatus);
    });
  });
});