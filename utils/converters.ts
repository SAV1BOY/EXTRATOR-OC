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
  const numeroOC = data.orderNumber || 'N/A';
  const nomeFornecedor = data.supplier.name || 'N/A';
  const valorTotal = data.totals.totalValue.toFixed(2).replace('.', ',');
  const condicaoPagamento = data.payment.condition || '-';
  const freteCondicao = data.payment.freight || '-';
  const dataEmissao = data.date || 'N/A';

  let message = `---
Confirmamos a emissão da Ordem de Compra nº *${numeroOC}* para a *${nomeFornecedor}* referente aos itens cotados.

---\n`;

  message += `Os detalhes do pedido são:\n\n`;

  data.items.forEach(item => {
    message += `*_[${item.code} - ${item.description} - Qtde: ${item.quantity} ${item.unit}]_*\n`;
  });

  message += `\n`;
  message += `*_Valor Total: R$ ${valorTotal}_*\n`;
  message += `*_Condição de Pagamento: ${condicaoPagamento}_*\n`;
  message += `*_Condição de Frete: ${freteCondicao}_*\n\n`;

  message += `Segue em Anexo a Ordem de compras:\n\n`;
  message += `📎 *OC - ${numeroOC} - ${nomeFornecedor} - ${dataEmissao}*\n\n`;
  message += `---`;

  return message;
};