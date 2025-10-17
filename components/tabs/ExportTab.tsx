import React, { useState } from 'react';
import { ExtractedData, ExportFormat } from '../../types';
import { Download, FileJson, FileText, FileCode, RefreshCw, Copy, Check } from 'lucide-react';
import { formatForWhatsapp } from '../../utils/converters';


interface ExportTabProps {
  data: ExtractedData;
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  handleExport: () => void;
  handleNewExtraction: () => void;
}

const ExportTab: React.FC<ExportTabProps> = ({ 
  data, exportFormat, setExportFormat, handleExport, handleNewExtraction 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToWhatsapp = () => {
    const whatsappText = formatForWhatsapp(data);
    navigator.clipboard.writeText(whatsappText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  }

  const formats: { id: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { id: 'json', label: 'JSON', icon: <FileJson size={20} /> },
    { id: 'csv', label: 'CSV', icon: <FileText size={20} /> },
    { id: 'xml', label: 'XML', icon: <FileCode size={20} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Exportar Dados</h3>
      <p className="text-slate-500 mb-6">
        A extração da OC <strong>{data.orderNumber}</strong> foi concluída. Escolha um formato para baixar os dados.
      </p>

      <div className="mb-6">
        <label className="font-semibold text-slate-700 mb-3 block">Formato do Arquivo</label>
        <div className="flex justify-center gap-4">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setExportFormat(format.id)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                exportFormat === format.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {format.icon}
              <span className="font-semibold">{format.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleExport}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-indigo-500 rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
        >
          <Download size={18} />
          Exportar Arquivo
        </button>
        <button
          onClick={handleNewExtraction}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-300"
        >
          <RefreshCw size={18} />
          Nova Extração
        </button>
      </div>
      
      <div className="mt-8 border-t pt-6">
        <h4 className="font-semibold text-slate-700 mb-3 block">Ações Rápidas</h4>
        <button
            onClick={handleCopyToWhatsapp}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                copied 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-700 text-white hover:bg-slate-800'
            }`}
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar para WhatsApp'}
        </button>
      </div>
    </div>
  );
};

export default ExportTab;
