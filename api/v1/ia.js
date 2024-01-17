import axios from 'axios'


const apiKey = 'B0ayZrLmS19aqobZA2wsYToeSqDz9cTm';
const base_url = 'https://api.deepinfra.com/v1/openai';

const stream = true; // or false

const MODEL_DI = 'mistralai/Mixtral-8x7B-Instruct-v0.1';



const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
};

const axiosInstance = axios.create({
  baseURL: base_url,
  headers: headers,
  responseType: 'stream',
});

let dataBuffer = '';
let message = "";
const handleStreamData = (chunk) => {
  dataBuffer += chunk.toString();

  // Check if the buffer contains a complete JSON object
  const jsonObjects = dataBuffer.substring(5,dataBuffer.length);
  if (jsonObjects.length > 1) {
    if(!jsonObjects.includes("DONE")){
      const event = JSON.parse(jsonObjects);
      message += event.choices[0].delta.content; //guarda cada parte de la respuesta
    }
    dataBuffer = '';
  }
};


function moderar(post){

  //let post= "no te anotes en soporte no enseña nada"

  const requestData = {
    model: MODEL_DI,
    messages: [
      { role: 'user', content: "Sos un filtro para moderar contenido por favor solo responde en formato json con cuan apropiado (del 0 al 100, no se permiten insultos) es el siguiente post en un contexto de un foro universitario donde los estudiantes se dan consejos: formato= { apropiado: xx, motivo:xx}"+post
  }],
    stream: stream,
    max_tokens: 1000,
  };


  axiosInstance.post('/chat/completions', requestData)
    .then(response => {
      const stream = response.data;
      console.log(requestData.messages[0].content)
      stream.on('data', handleStreamData);

      stream.on('end', () => {
        message = message.split("undefined")[0]; //al final siempre tiene un undefined
        console.log(JSON.parse(message.trim())); //ESTA ES LA RESPUESTA
        return JSON.parse(message.trim())
      });
    })
    .catch(error => {
      console.error('API Error:', error.response ? error.response.data : error.message);
    });


}


export {moderar};
