import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processDocumentWithAI(ocrText: string, fileName: string): Promise<any> {
  try {
    const prompt = `
You are analyzing a Marathi government document. Extract the following information from this OCR text:

OCR Text: ${ocrText}

Please extract and return a JSON object with these fields in Marathi:
- office (कार्यालय): The government office name
- recipientName (पत्र प्राप्तकर्ता): Name of the recipient
- serialNumber (क्रमांक): Document serial/reference number
- letterDate (पत्र दिनांक): Date of the letter
- receivedDate (प्राप्त दिनांक): Date received (if mentioned)
- author (लेखक): Author or sender name
- letterType (पत्र प्रकार): Type of letter (गोपनीय, शासन पत्र, तक्रार, अर्ज, etc.)
- subject (विषय): Subject of the letter
- topic (मुद्दा): Main topic or content summary
- mobile (मोबाइल): Mobile number if mentioned
- documentCount (कागदपत्रांची संख्या): Number of attached documents

Only return valid JSON. If information is not available, use null for that field.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting structured data from Marathi government documents. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
    });

    const extractedData = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      extractedData,
      confidence: 0.95,
      aiAnalysis: {
        documentType: extractedData.letterType || "अज्ञात",
        summary: extractedData.topic || "विषय अनुपलब्ध",
        processingModel: "GPT-4",
        extractionTimestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error processing document with AI:', error);
    return {
      extractedData: {},
      confidence: 0,
      aiAnalysis: {
        error: "AI processing failed",
        processingModel: "GPT-4",
        extractionTimestamp: new Date().toISOString()
      }
    };
  }
}

export async function performOCR(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
  try {
    // Using Google Vision API for OCR
    const base64Image = imageBuffer.toString('base64');
    
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      })
    });

    const result = await response.json();
    
    if (result.responses && result.responses[0].textAnnotations) {
      const textAnnotation = result.responses[0].textAnnotations[0];
      return {
        text: textAnnotation.description || '',
        confidence: textAnnotation.confidence || 0.8
      };
    }
    
    return {
      text: '',
      confidence: 0
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    return {
      text: '',
      confidence: 0
    };
  }
}

export async function generateDocumentSummary(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a government document analyst. Provide concise summaries in Marathi for government documents."
        },
        {
          role: "user",
          content: `Summarize this government document content in Marathi (2-3 sentences):\n\n${content}`
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    return completion.choices[0].message.content || "सारांश उपलब्ध नाही";
  } catch (error) {
    console.error('Error generating summary:', error);
    return "सारांश तयार करण्यात त्रुटी";
  }
}