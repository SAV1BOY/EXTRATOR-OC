
import React from 'react';
import { ExtractedData } from '../../types';
import { AlertCircle, Check, CheckCircle, X } from 'lucide-react';

interface ValidationTabProps {
  errors: string[];
  warnings: string[];
  confidence: number;
  data: ExtractedData;
}

const ValidationTab: React.FC<ValidationTabProps> = ({ errors, warnings, confidence, data }) => {
  const confidencePercent = (confidence * 100).toFixed(0);
  const confidenceColor = confidence > 0.8 ? 'green' : confidence > 0.5 ? 'yellow' : 'red';

  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      bar: 'bg-green-500'
    },
    yellow: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      bar: 'bg-yellow-500'
    },
    red: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-800',
      bar: 'bg-red-500'
    }
  };

  const currentColors = colorClasses[confidenceColor];
  
  const hasTotalMismatch = warnings.some(w => w.includes('Total calculado'));
  const isCnpjValid = !warnings.some(w => w.includes('CNPJ'));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800">Status da Validação</h3>
      
      <div className={`p-4 rounded-lg border-2 ${currentColors.bg} ${currentColors.border}`}>
        <div className="flex justify-between items-center">
          <span className={`font-semibold ${currentColors.text}`}>Índice de Confiança</span>
          <span className={`text-2xl font-bold ${currentColors.text}`}>{confidencePercent}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
          <div className={`h-2.5 rounded-full ${currentColors.bar}`} style={{ width: `${confidencePercent}%` }}></div>
        </div>
      </div>
      
      {errors.length === 0 && warnings.length === 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-100 border-2 border-green-300 rounded-lg text-green-800">
          <CheckCircle size={24} />
          <div>
            <strong className="font-semibold">Validação Completa!</strong>
            <p className="text-sm">Todos os dados foram extraídos e validados com sucesso.</p>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-3">
            <h4 className="font-semibold text-red-700 flex items-center gap-2"><X size={20} />Erros Encontrados ({errors.length})</h4>
            {errors.map((error, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-red-100 border border-red-200 rounded-md text-red-800 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-3">
            <h4 className="font-semibold text-yellow-700 flex items-center gap-2"><AlertCircle size={20} />Avisos ({warnings.length})</h4>
            {warnings.map((warning, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-yellow-100 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                    <AlertCircle size={16} />
                    <span>{warning}</span>
                </div>
            ))}
        </div>
      )}

      <div className="p-4 bg-slate-50 rounded-lg border">
        <h4 className="font-semibold text-slate-700 mb-3">Detalhes da Validação</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            {data.orderNumber ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
            Número da OC identificado
          </li>
          <li className="flex items-center gap-2">
            {data.date ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
            Data extraída corretamente
          </li>
          <li className="flex items-center gap-2">
            {data.items.length > 0 ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
            Itens processados ({data.items.length})
          </li>
          <li className="flex items-center gap-2">
            {!hasTotalMismatch ? <Check size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
            Totais conferem
          </li>
          <li className="flex items-center gap-2">
            {isCnpjValid ? <Check size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
            Formato de CNPJ válido
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ValidationTab;
