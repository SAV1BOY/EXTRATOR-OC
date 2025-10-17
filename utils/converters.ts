import { ExtractedData } from '../types';

function escapeCSV(str: string | number | null | undefined): string {
    if (str === null || str === undefined) {
        return '';
    }
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export const convertToCSV = (data: ExtractedData): string => {
    if (!data || !data.items || data.items.length === 0) {
        return '';
    }

    const headers = [
        'orderNumber', 'date', 'supplierName',
        'itemCode', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemIpi', 'itemTotal', 'itemDeliveryDate'
    ];

    const rows = data.items.map(item => [
        escapeCSV(data.orderNumber),
        escapeCSV(data.date),
        escapeCSV(data.supplier.name),
        escapeCSV(item.code),
        escapeCSV(item.description),
        escapeCSV(item.quantity),
        escapeCSV(item.unit),
        escapeCSV(item.unitPrice),
        escapeCSV(item.ipi),
        escapeCSV(item.total),
        escapeCSV(item.deliveryDate),
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
};

function escapeXML(str: string | number | null | undefined): string {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

const itemToXML = (item: any) => {
    const itemFields = Object.entries(item).map(([key, value]) => `    <${key}>${escapeXML(value as string)}</${key}>`).join('\n');
    return `  <Item>\n${itemFields}\n  </Item>`;
};

const objectToXML = (obj: any, indent: string = '  ') => {
    return Object.entries(obj)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${indent}<${key}>${escapeXML(value as string)}</${key}>`)
        .join('\n');
}

export const convertToXML = (data: ExtractedData): string => {
    const { metadata, items, supplier, buyer, payment, totals, ...restOfData } = data;

    const itemsXML = items.map(itemToXML).join('\n');
    const supplierXML = objectToXML(supplier);
    const buyerXML = objectToXML(buyer);
    const paymentXML = objectToXML(payment);
    const totalsXML = objectToXML(totals);

    return `<?xml version="1.0" encoding="UTF-8"?>
<PurchaseOrder>
  <orderNumber>${escapeXML(restOfData.orderNumber)}</orderNumber>
  <date>${escapeXML(restOfData.date)}</date>
  <Supplier>
${supplierXML}
  </Supplier>
  <Buyer>
${buyerXML}
  </Buyer>
  <Payment>
${paymentXML}
  </Payment>
  <Items>
${itemsXML}
  </Items>
  <Totals>
${totalsXML}
  </Totals>
</PurchaseOrder>`;
};

export const formatForWhatsapp = (data: ExtractedData): string => {
  let message = `*Resumo da Ordem de Compra: ${data.orderNumber || 'N/A'}*\n\n`;
  
  message += `*Fornecedor:* ${data.supplier.name || 'N/A'}\n`;
  message += `*Data:* ${data.date || 'N/A'}\n`;
  message += `*Valor Total:* ${data.totals.totalValueFormatted || 'R$ 0,00'}\n\n`;
  
  message += `*Itens (${data.items.length}):*\n`;
  data.items.forEach(item => {
    message += `  - ${item.quantity} ${item.unit} | ${item.description} (Cód: ${item.code})\n`;
  });
  
  message += `\n*Condição de Pagamento:* ${data.payment.condition || 'N/A'}\n`;

  return message;
};
