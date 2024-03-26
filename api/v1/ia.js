import event from 'events';
event.EventEmitter.defaultMaxListeners = 50;

const apiKey = process.env.IA_APIKEY;
const base_url = process.env.IA_BASE_URL;
const MODEL_DI = process.env.IA_MODEL_DI;

const stream = false; // Cambiado a false

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
};

async function moderar(post) {
  const requestData = {
    model: MODEL_DI,
    messages: [
      { role: 'user', content: "Sos un filtro para moderar contenido por favor solo responde en formato json con cuan apropiado (del 0 al 100, no se permiten insultos) es el siguiente post en un contexto de un foro universitario donde los estudiantes se dan consejos: formato= { apropiado: xx, motivo:xx} Mensaje: " + post }
    ],
    stream: stream,
    max_tokens: 1000,
  };

  const requestOptions = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestData),
  };

  try {
    const response = await fetch(`${base_url}/chat/completions`, requestOptions);
    const responseData = await response.json();
    return JSON.parse(responseData.choices[0].message.content);
  } catch (error) {
    throw error;
  }
}

async function moderarWithRetry(post, maxRetries = 3, retryDelay = 1000) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Intenta la operación
      const result = await moderar(post);
      return result;
    } catch (error) {
      retries++;

      // Espera un retraso especificado antes de intentarlo de nuevo
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // Si todos los intentos fallan, arroja el último error
  throw new Error(`Failed after ${maxRetries} attempts.`);
}

export { moderarWithRetry };
