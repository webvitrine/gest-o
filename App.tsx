
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, FinancialSummary, AIInsight } from './types';
import { CATEGORIES, INITIAL_TRANSACTIONS } from './constants';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import AIInsightsList from './components/AIInsightsList';
import Auth from './components/Auth';
import { getFinancialInsights } from './services/geminiService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch transactions from Supabase (filtered by user)
  const fetchTransactions = useCallback(async () => {
    if (!user || !supabase) {
      loadFromLocalStorage();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao buscar do Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('finanza_transactions');
    setTransactions(saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS);
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Summary logic
  const summary: FinancialSummary = useMemo(() => {
    let balance = 0;
    let income = 0;
    let expenses = 0;
    const breakdown: Record<string, number> = {};

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') {
        balance += amount;
        income += amount;
      } else {
        balance -= amount;
        expenses += amount;
        breakdown[t.category] = (breakdown[t.category] || 0) + amount;
      }
    });

    const categoriesBreakdown = CATEGORIES
      .filter(c => c.id !== 'income')
      .map(c => ({
        name: c.name,
        value: breakdown[c.id] || 0,
        color: c.color
      }));

    return { totalBalance: balance, monthlyIncome: income, monthlyExpenses: expenses, categoriesBreakdown };
  }, [transactions]);

  const fetchAIInsights = useCallback(async () => {
    if (transactions.length === 0) return;
    setLoadingInsights(true);
    try {
      const data = await getFinancialInsights(transactions);
      setInsights(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingInsights(false);
    }
  }, [transactions]);

  const handleAddTransaction = async (newT: Omit<Transaction, 'id'>) => {
    if (user && supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([{ ...newT, user_id: user.id }])
          .select();

        if (error) throw error;
        if (data) setTransactions(prev => [data[0], ...prev]);
      } catch (error) {
        alert('Erro ao salvar no Supabase.');
        console.error(error);
      }
    } else {
      const localT: Transaction = {
        ...newT,
        id: Math.random().toString(36).substr(2, 9),
      };
      setTransactions(prev => [localT, ...prev]);
      localStorage.setItem('finanza_transactions', JSON.stringify([localT, ...transactions]));
    }
  };

  const removeTransaction = async (id: string) => {
    if (user && supabase) {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setTransactions(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        alert('Erro ao excluir do banco de dados.');
        console.error(error);
      }
    } else {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('finanza_transactions', JSON.stringify(updated));
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  // If Supabase is configured but user is not logged in, show Auth
  if (isSupabaseConfigured && !user && !isLoading) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                F
              </div>
              <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Finanza AI</h1>
            </div>
            
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSupabaseConfigured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
              {isSupabaseConfigured ? 'Cloud Sync' : 'Modo Local'}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-semibold text-gray-800">{user.email}</p>
                  <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold hover:underline">SAIR</button>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                  {user.email?.charAt(0)}
                </div>
              </div>
            )}
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Novo</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Dashboard summary={summary} transactions={transactions} />

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Transações</h3>
              <div className="flex items-center gap-4">
                {isLoading && <span className="text-xs text-blue-500 animate-pulse">Sincronizando...</span>}
                <span className="text-sm text-gray-500">{transactions.length} registros</span>
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {isLoading && transactions.length === 0 ? (
                 <div className="py-20 text-center text-gray-400">
                    <p className="animate-pulse">Carregando seus dados...</p>
                 </div>
              ) : transactions.length > 0 ? transactions.map((t) => {
                const category = CATEGORIES.find(c => c.id === t.category) || CATEGORIES[CATEGORIES.length-1];
                return (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{t.description}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {new Date(t.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })} • {category.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button 
                        onClick={() => removeTransaction(t.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 text-center text-gray-400">
                  <p>Nenhuma transação encontrada.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <AIInsightsList 
            insights={insights} 
            loading={loadingInsights} 
            onRefresh={fetchAIInsights} 
          />
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg border border-blue-500/20">
            <h4 className="font-bold text-lg mb-2">
              {user ? 'Controle Total' : 'Configuração Pendente'}
            </h4>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">
              {user 
                ? `Bem-vindo de volta! Suas transações estão protegidas e sincronizadas em todos os seus dispositivos.` 
                : 'Defina SUPABASE_URL e SUPABASE_ANON_KEY no ambiente para habilitar contas de usuário e sincronização.'}
            </p>
            {!user && (
              <div className="p-3 bg-blue-900/30 rounded-lg text-[10px] font-mono break-all opacity-80">
                Utilizando localStorage para armazenamento temporário.
              </div>
            )}
          </div>
        </div>
      </main>

      {isFormOpen && (
        <TransactionForm 
          onAdd={handleAddTransaction} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
