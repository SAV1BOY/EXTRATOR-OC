import React, { useState } from 'react';
import { ExtractedData } from '../../types';
import { ShoppingCart, Calendar, User, Building, CreditCard, Hash, Copy, Check } from 'lucide-react';
import { formatForWhatsapp } from '../../utils/converters';


interface ResultsTabProps {
  data: ExtractedData;
}

const InfoCard: React.FC<{ title: string, children: React.ReactNode, icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-slate-50 p-4 rounded-lg border">
        <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        <div className="text-slate-800 space-y-1">{children}</div>
    </div>
);

const ResultsTab: React.FC<ResultsTabProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToWhatsapp = () => {
    const whatsappText = formatForWhatsapp(data);
    navigator.clipboard.writeText(whatsappText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  }


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard title="Número da OC" icon={<Hash size={16} />}>
            <p className="font-bold text-lg">{data.orderNumber || 'N/A'}</p>
        </InfoCard>
        <InfoCard title="Data do Pedido" icon={<Calendar size={16} />}>
            <p>{data.date || 'N/A'}</p>
        </InfoCard>
        <InfoCard title="Fornecedor" icon={<User size={16} />}>
            <p className="font-semibold">{data.supplier.name || 'N/A'}</p>
            <p className="text-sm text-slate-600">{data.supplier.contact}</p>
            <p className="text-sm text-slate-600">{data.supplier.phone}</p>
        </InfoCard>
        <InfoCard title="Comprador" icon={<Building size={16} />}>
            <p className="font-semibold">{data.buyer.company || 'N/A'}</p>
            <p className="text-sm text-slate-600">{data.buyer.cnpj}</p>
            <p className="text-sm text-slate-600">{data.buyer.address}</p>
        </InfoCard>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <ShoppingCart size={20} />
          Itens da Ordem de Compra ({data.items.length})
        </h3>
        <button
            onClick={handleCopyToWhatsapp}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                copied 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-700 text-white hover:bg-slate-800'
            }`}
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar para WhatsApp'}
        </button>
      </div>

      <div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th scope="col" className="px-4 py-3">Código</th>
                <th scope="col" className="px-4 py-3">Descrição</th>
                <th scope="col" className="px-4 py-3 text-right">Qtd.</th>
                <th scope="col" className="px-4 py-3">Un.</th>
                <th scope="col" className="px-4 py-3 text-right">Preço Unit.</th>
                <th scope="col" className="px-4 py-3 text-right">Total</th>
                <th scope="col" className="px-4 py-3">Entrega</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.code}</td>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                  <td className="px-4 py-3 text-right">{item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{item.total.toFixed(2)}</td>
                  <td className="px-4 py-3">{item.deliveryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="Pagamento" icon={<CreditCard size={16} />}>
              <p><strong>Condição:</strong> {data.payment.condition || 'N/A'}</p>
              <p><strong>Frete:</strong> {data.payment.freight || 'N/A'}</p>
          </InfoCard>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
             <h3 className="text-sm font-semibold text-indigo-600 mb-2">Totais</h3>
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Itens:</span>
                    <span className="font-semibold text-slate-800">{data.totals.itemCount}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Quantidade:</span>
                    <span className="font-semibold text-slate-800">{data.totals.totalQuantity}</span>
                </div>
                <hr className="my-2"/>
                <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-indigo-800">Valor Total:</span>
                    <span className="font-bold text-indigo-800">{data.totals.totalValueFormatted || `R$ ${data.totals.totalValue.toFixed(2)}`}</span>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default ResultsTab;
