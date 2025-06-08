import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const apiKey = process.env.GEMINI_API_KEY;
let genAI;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);// Inicializa la API de Gemini con la clave de API
  console.log('✅ Gemini API inicializada correctamente');
} else {
  console.warn('⚠️ Advertencia: No se encontró GEMINI_API_KEY en .env');
}

export const generateDebateResponse = async (prompt, context) => {
  try {
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", 
      generationConfig: {
        temperature: 0.7,
        topP: 0.9
      }
    });
    
    const fullPrompt = `
${prompt}

Contexto actual del debate:
${context}

Instrucciones:
- Proporciona una respuesta bien argumentada en español
- Mantén el personaje y su estilo comunicativo (vocabulario, tono, nivel de análisis)
- Responde directamente al tema en discusión sin repetir el contexto
- Sé persuasivo, claro y fiel al enfoque filosófico o científico del personaje
- Evita ambigüedades y exageraciones; prioriza la precisión conceptual
- Utiliza un lenguaje accesible sin simplificar en exceso
- Limita tu respuesta a un máximo de 50 palabras
- No incluyas introducciones, despedidas ni frases genéricas
`;


    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error con Gemini API:', {
      message: error.message,
      status: error.status,
      stack: error.stack
    });
    throw new Error('Error al generar la respuesta del debate');
  }
};