import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly apiKey = 'AIzaSyBTpKlHaU1g1kgSEe6qw4en-LVGHTQLqC4';
  
  private readonly apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${this.apiKey}`;

  async getBotResponse(userMessage: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Sen DevConnect projesinin teknik asistanısın. Kısa, öz ve samimi bir cevap ver: ${userMessage}`
            }]
          }]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('--- HATA DETAYI ---', JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || 'API Hatası');
      }

      return data.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error('--- MESAJ GÖNDERİLEMEDİ ---', error.message);
      return "Kusura bakma reis, ufak bir bağlantı sorunu oldu. Tekrar dener misin?";
    }
  }
}