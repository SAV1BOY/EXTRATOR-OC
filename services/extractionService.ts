import { ExtractedData, Item, Totals, ValidationResult } from '../types';

// Helper to parse Brazilian-style numbers (e.g., "1.234,56")
const parseBRLNumber = (str: string | null | undefined): number => {
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
};

// ==================== RULE-BASED EXTRACTION ENGINE ====================
export class ExtractionEngine {
  public extract(text: string, fileName: string): ExtractedData {
    if (!text || text.trim().length < 20) {
      throw new Error("O conteúdo do documento está vazio ou é muito curto para ser processado.");
    }

    const orderNumber = this.extractOrderNumber(text);
    const date = this.extractDate(text);
    const supplier = this.extractSupplier(text);
    const items = this.extractItems(text);
    const payment = this.extractPayment(text);
    const documentTotal = this.extractTotal(text);

    const buyerTemplate = {
        company: 'CLICK ILUMINACAO LTDA',
        cnpj: '06.293.416/0001-21',
        address: 'AV. BENEDITO ALVES NAZARETH, 883, 40 - CAMPO DO PIRES',
        city: 'NOVA LIMA (MG)',
        phone: '(31) 3589-1424',
    };
    
    const totals = this.calculateTotals(items, documentTotal);

    const result: ExtractedData = {
        orderNumber,
        date,
        supplier,
        buyer: buyerTemplate,
        items,
        payment,
        totals,
        metadata: {
            fileName: fileName,
            extractionTime: new Date().toISOString(),
            confidence: this.calculateConfidence({ orderNumber, date, supplier, items, payment, totals }),
            source: 'Local Engine',
            method: 'RegEx & Text Parsing'
        },
    };

    return result;
  }
  
  private extractOrderNumber = (text: string): string | null => {
      const match = text.match(/ORDEM DE COMPRA:\s*N[º°]?\s*(\d+)/i);
      return match ? match[1] : null;
  }
  
  private extractDate = (text: string): string | null => {
      const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
      return match ? match[1] : null;
  }

  private extractSupplier = (text: string): { name: string | null; contact: string | null; phone: string | null; } => {
    // This regex looks for a block of text that starts with 'Fornecedor:'
    const supplierBlockMatch = text.match(/Fornecedor:[\s\S]*?(?=Contato:|Codigo\s+Descrição)/i);
    const supplierBlock = supplierBlockMatch ? supplierBlockMatch[0] : text; // Fallback to full text if block not found

    const nameMatch = supplierBlock.match(/Fornecedor:\s*(.*?)(?:\s*Telefone:|\s*Fax:|$)/i);
    const contactMatch = supplierBlock.match(/Contato:\s*([^\r\n]+)/i);
    const phoneMatch = supplierBlock.match(/Telefone:\s*([\d.\s-]+)/i);
    
    // Clean up the name from other fields if they were captured
    let name = nameMatch ? nameMatch[1].trim() : null;
    if (name) {
      name = name.replace(/Telefone:[\s\S]*/i, '').replace(/Fax:[\s\S]*/i, '').trim();
    }

    return {
      name: name,
      contact: contactMatch ? contactMatch[1].trim() : null,
      phone: phoneMatch ? phoneMatch[1].trim() : null,
    };
  }

  private extractPayment = (text: string): { condition: string | null; freight: string | null; } => {
    const conditionMatch = text.match(/Condição:\s*([^\r\n]+)/i);
    const freightMatch = text.match(/Frete:\s*([^\r\n]+)/i);
    return {
      condition: conditionMatch ? conditionMatch[1].trim() : null,
      freight: freightMatch ? freightMatch[1].trim() : null,
    };
  }
  
  private extractTotal = (text: string): number | null => {
    const match = text.match(/TOTAL:\s*([\d.,]+)/i);
    return match ? parseBRLNumber(match[1]) : null;
  }

  private extractItems = (text: string): Item[] => {
    const items: Item[] = [];
    const lines = text.split('\n');
    const itemStartIndex = lines.findIndex(line => line.match(/Codigo\s+Descrição/i));

    if (itemStartIndex === -1) {
      return []; // No item table header found
    }

    let itemEndIndex = lines.findIndex((line, idx) => 
        idx > itemStartIndex && 
        (line.match(/Sr\.\s+Fornecedor/i) || line.match(/Para pagamentos à vista/i) || line.match(/FORMA PAGAMENTO/i))
    );

    if (itemEndIndex === -1) {
      itemEndIndex = lines.length;
    }

    const itemSection = lines.slice(itemStartIndex + 1, itemEndIndex).join('\n');
    
    // This new, more robust regex is designed to be flexible with column spacing and complex descriptions.
    // It captures all key fields, including IPI.
    const itemLineRegex = /^(\d+)\s+(.+?)\s+([\d.,]+)\s+([A-Z]{2,4})\s+[\d.,]+\s+[\d.,]+\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)\s+(\d{2}\/\d{2}\/\d{2,4})/gm;
    // Groups: 1:Code | 2:Description | 3:Quantity | 4:Unit | 5:UnitPrice | 6:IPI | 7:Total | 8:Date

    let match;
    while ((match = itemLineRegex.exec(itemSection)) !== null) {
      items.push({
        code: match[1].trim(),
        description: match[2].trim().replace(/\s*=>:.*$/, '').trim(),
        quantity: parseBRLNumber(match[3]),
        unit: match[4].trim(),
        unitPrice: parseBRLNumber(match[5]),
        ipi: parseBRLNumber(match[6]),
        total: parseBRLNumber(match[7]),
        deliveryDate: match[8].trim(),
      });
    }

    return items;
  }


  private calculateConfidence(data: Partial<ExtractedData>): number {
    let score = 0;
    const maxScore = 6; 

    if (data.orderNumber) score++;
    if (data.date) score++;
    if (data.supplier?.name) score++;
    if (data.items && data.items.length > 0) score++;
    if (data.payment?.condition) score++;
    if (data.totals?.documentTotal && data.totals.documentTotal > 0) score++;
    
    // Return a value between 0 and 1, which will be displayed as a percentage
    return score / maxScore;
  }

  private calculateTotals(items: Item[], documentTotal: number | null): Totals {
    const calculated = items.reduce(
      (acc, item) => ({
        totalQuantity: acc.totalQuantity + (item.quantity || 0),
        totalValue: acc.totalValue + (item.total || 0),
        itemCount: acc.itemCount + 1,
      }),
      { totalQuantity: 0, totalValue: 0, itemCount: 0 }
    );
    
    const finalTotal = documentTotal ?? calculated.totalValue;

    return {
      ...calculated,
      totalValue: finalTotal,
      documentTotal: documentTotal,
      totalValueFormatted: `R$ ${finalTotal.toFixed(2).replace('.', ',')}`,
    };
  }
}

// ==================== VALIDATION SYSTEM ====================
export class ValidationSystem {
  public validate(data: ExtractedData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.orderNumber) {
      errors.push('Número da OC não identificado');
    }
    if (!data.items || data.items.length === 0) {
      errors.push('Nenhum item encontrado no documento');
    }

    const calculatedFromItems = data.items.reduce((sum, item) => sum + (item.total || 0), 0);
    if (data.totals.documentTotal && Math.abs(calculatedFromItems - data.totals.documentTotal) > 1.0) {
      warnings.push(
        `Soma dos itens (R$ ${calculatedFromItems.toFixed(2)}) difere do total do documento (R$ ${data.totals.documentTotal.toFixed(2)})`
      );
    }
    
    if (data.buyer.cnpj && !this.validateCNPJ(data.buyer.cnpj)) {
      warnings.push('CNPJ em formato inválido');
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }

  private validateCNPJ(cnpj: string): boolean {
    return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
  }
}