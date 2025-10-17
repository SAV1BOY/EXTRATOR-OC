import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set worker path for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.min.mjs`;

export class DocumentProcessor {
  public async fileToText(file: File): Promise<string> {
    const fileType = file.type;
    if (fileType === 'application/pdf') {
      return this.pdfToText(file);
    } else if (fileType.startsWith('image/')) {
      return this.imageToText(file);
    } else if (fileType === 'text/html') {
      return this.htmlToText(file);
    } else if (fileType.startsWith('text/')) {
      return this.readAsText(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Please upload a PDF, HTML, image, or text file.`);
    }
  }

  private async pdfToText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const lines: { [y: number]: { x: number, str: string }[] } = {};
      textContent.items.forEach(item => {
          if ('str' in item && item.str.trim()) {
              const y = Math.round(item.transform[5]);
              const x = Math.round(item.transform[4]);
              if (!lines[y]) lines[y] = [];
              lines[y].push({ x, str: item.str });
          }
      });

      const pageText = Object.keys(lines)
          .map(Number)
          .sort((a, b) => b - a) // Sort lines from top to bottom
          .map(y => lines[y].sort((a, b) => a.x - b.x).map(item => item.str).join(' ')) // Sort text within a line from left to right
          .join('\n');
      
      fullText += pageText + '\n\n';
    }

    return fullText;
  }

  private async imageToText(file: File): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(file, 'por', {
        logger: m => console.log(m) // Optional: logs progress
    });
    return text;
  }

  private async htmlToText(file: File): Promise<string> {
    const htmlString = await this.readAsText(file);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    // Using innerText preserves line breaks better than textContent for tables
    return (doc.body as HTMLElement).innerText || '';
  }

  private readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file, 'ISO-8859-1');
    });
  }
}