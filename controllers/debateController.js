import PDFDocument from 'pdfkit';
import { generateDebateResponse } from '../services/geminiService.js';
import Debate from '../models/Debate.js';

const EXPERTS = {
  pro: {
    name: "George Church",
    prompt: `Actúa como George Church, genetista visionario, pionero en la edición genética y cofundador de múltiples iniciativas en biotecnología. Tienes un profundo conocimiento en CRISPR, biología sintética y secuenciación de ADN. Tu tarea es defender de forma informada, ética y accesible los beneficios de la edición genética para la humanidad, incluyendo su potencial en medicina, agricultura y conservación. Usa un tono técnico pero comprensible para el público general, citando ejemplos reales y anticipando preocupaciones comunes como la bioética, la equidad y los riesgos. Responde en español como si dieras una entrevista o charla divulgativa.`
  },
  against: {
    name: "Francis Fukuyama",
    prompt: `Actúa como Francis Fukuyama, filósofo político reconocido por su análisis sobre la modernidad, la biotecnología y los riesgos del transhumanismo. Desde una perspectiva humanista y política, analiza críticamente los riesgos éticos, sociales y filosóficos de la edición genética, incluyendo su impacto en la dignidad humana, la igualdad, la democracia y la naturaleza de lo que significa ser humano. Sé persuasivo pero equilibrado, apelando tanto a argumentos racionales como a consideraciones morales. Usa ejemplos históricos y actuales, y responde en español como si ofrecieras una conferencia o ensayo dirigido a un público culto pero no especializado.`
  }
};

// Obtener el historial del debate
export const getDebateHistory = async (req, res) => {
  try {
    const history = await Debate.find().sort({ createdAt: 1 });
    res.status(200).json({
      success: true,  
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener historial",
      error: error.message
    });
  }
};

// Añadir respuesta de experto
export const addExpertResponse = async (req, res) => {
  const { type } = req.params;
  const expert = EXPERTS[type];

  if (!expert) {
    return res.status(400).json({
      success: false,
      message: "Tipo de experto no válido"
    });
  }

  try {
    const history = await Debate.find().sort({ createdAt: 1 });
    const context = history.map(msg => `${msg.speaker}: ${msg.message}`).join('\n');

    const response = await generateDebateResponse(expert.prompt, context);

    const newMessage = await Debate.create({
      speaker: expert.name,
      message: response,
      role: type
    });

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error en addExpertResponse:', error);
    res.status(500).json({
      success: false,
      message: "Error al generar respuesta",
      error: error.message
    });
  }
};

// Limpiar el historial
export const clearHistory = async (req, res) => {
  try {
    await Debate.deleteMany({});
    res.json({
      success: true,
      message: 'Historial limpiado correctamente'
    });
  } catch (error) {
    console.error('Error al limpiar historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar historial',
      error: error.message
    });
  }
};

// Exportar a PDF pdfkit
export const exportToPDF = async (req, res) => {
  try {
    const history = await Debate.find().sort({ createdAt: 1 });

    const doc = new PDFDocument();
    const filename = `debate_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20)
      .font('Helvetica-Bold')
      .text('Historial del Debate', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(10)
      .font('Helvetica')
      .text(`Generado el: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.moveDown(1);

    history.forEach((msg, index) => {
      if (msg.role === 'moderator') {
        doc.fontSize(14)
          .fillColor('#333333')
          .text(msg.message, { align: 'center' });
      } else {
        const color = msg.role === 'pro' ? '#4CAF50' : '#F44336';
        doc.fontSize(12)
          .fillColor(color)
          .text(`${msg.speaker}:`, { continued: true })
          .fillColor('#333333')
          .text(` ${msg.message}`);

        doc.fontSize(8)
          .fillColor('#666666')
          .text(`Enviado el: ${new Date(msg.createdAt).toLocaleString()}`);
      }

      doc.moveDown(0.5);
      if (index < history.length - 1) {
        doc.moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .strokeColor('#cccccc')
          .stroke();
        doc.moveDown(0.5);
      }
    });

    doc.end();

  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF',
      error: error.message
    });
  }
};