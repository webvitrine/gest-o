
import React from 'react';
import { AIInsight } from '../types';

interface AIInsightsListProps {
  insights: AIInsight[];
  loading: boolean;
  onRefresh: () => void;
}

const AIInsightsList: React.FC<AIInsightsListProps> = ({ insights, loading, onRefresh }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'WARNING': return '⚠️';
      case 'OPPORTUNITY': return '💡';
      default: return '✅';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'WARNING': return 'bg-yellow-50 border-yellow-100';
      case 'OPPORTUNITY': return 'bg-blue-50 border-blue-100';
      default: return 'bg-green-50 border-green-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-800">Insights da IA</h4>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          {loading ? 'Analisando...' : 'Atualizar'}
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-xl">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className={`flex gap-4 p-4 border rounded-xl transition-all ${getBgColor(insight.type)}`}>
              <span className="text-2xl mt-1">{getIcon(insight.type)}</span>
              <div>
                <h5 className="font-semibold text-gray-800">{insight.title}</h5>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhum insight disponível no momento.</p>
        )}
      </div>
    </div>
  );
};

export default AIInsightsList;
