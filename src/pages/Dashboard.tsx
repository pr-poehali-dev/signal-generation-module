import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Signal {
  asset: string;
  timestamp: string;
  signal: 'UP' | 'DOWN' | 'NO_SIGNAL';
  recommended_expiration: number;
  entry_price: number;
  confidence: number;
  expected_move_pct: number;
  reasons: string[];
  indicators: {
    EMA8: number;
    EMA21: number;
    EMA50: number;
    RSI14: number;
    MACD_hist: number;
    ATR14: number;
    VWAP: number;
    orderbook_imbalance: number;
  };
  model_votes: {
    rule_based: number;
    ml_model_1: number;
    ml_model_2: number;
    ensemble_confidence: number;
  };
}

interface HistoricalSignal extends Signal {
  result: 'WIN' | 'LOSS';
  profit: number;
}

const mockSignals: Signal[] = [
  {
    asset: 'EURUSD',
    timestamp: new Date().toISOString(),
    signal: 'UP',
    recommended_expiration: 120,
    entry_price: 1.09532,
    confidence: 82,
    expected_move_pct: 0.12,
    reasons: [
      'EMA8 пересек EMA21 вверх',
      'Положительный trade imbalance +220%',
      'ML-ensemble прогноз UP (prob 0.81)'
    ],
    indicators: {
      EMA8: 1.09530,
      EMA21: 1.09510,
      EMA50: 1.09460,
      RSI14: 48.5,
      MACD_hist: 0.00008,
      ATR14: 0.00012,
      VWAP: 1.09525,
      orderbook_imbalance: 0.32
    },
    model_votes: {
      rule_based: 1,
      ml_model_1: 1,
      ml_model_2: 1,
      ensemble_confidence: 82
    }
  },
  {
    asset: 'BTCUSDT',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    signal: 'DOWN',
    recommended_expiration: 180,
    entry_price: 43250.50,
    confidence: 76,
    expected_move_pct: -0.18,
    reasons: [
      'EMA8 пробил EMA21 вниз',
      'RSI перепродан (72.3)',
      'Негативный orderbook imbalance -0.41'
    ],
    indicators: {
      EMA8: 43240.00,
      EMA21: 43280.00,
      EMA50: 43320.00,
      RSI14: 72.3,
      MACD_hist: -12.5,
      ATR14: 145.0,
      VWAP: 43260.00,
      orderbook_imbalance: -0.41
    },
    model_votes: {
      rule_based: 1,
      ml_model_1: 1,
      ml_model_2: 0,
      ensemble_confidence: 76
    }
  },
  {
    asset: 'GBPUSD',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    signal: 'UP',
    recommended_expiration: 60,
    entry_price: 1.27145,
    confidence: 68,
    expected_move_pct: 0.08,
    reasons: [
      'Пробой уровня сопротивления',
      'Положительный объем +150%',
      'MACD гистограмма растет'
    ],
    indicators: {
      EMA8: 1.27140,
      EMA21: 1.27120,
      EMA50: 1.27100,
      RSI14: 52.1,
      MACD_hist: 0.00015,
      ATR14: 0.00018,
      VWAP: 1.27135,
      orderbook_imbalance: 0.22
    },
    model_votes: {
      rule_based: 1,
      ml_model_1: 1,
      ml_model_2: 1,
      ensemble_confidence: 68
    }
  }
];

const mockHistory: HistoricalSignal[] = [
  { ...mockSignals[0], result: 'WIN', profit: 85 },
  { ...mockSignals[1], result: 'WIN', profit: 82 },
  { ...mockSignals[2], result: 'LOSS', profit: -100 }
];

const chartData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  price: 1.095 + Math.random() * 0.002,
  ema8: 1.0955 + Math.random() * 0.001,
  ema21: 1.0952 + Math.random() * 0.001
}));

const Dashboard = () => {
  const [activeSignals, setActiveSignals] = useState<Signal[]>(mockSignals);
  const [history] = useState<HistoricalSignal[]>(mockHistory);

  const totalTrades = history.length;
  const winTrades = history.filter(h => h.result === 'WIN').length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  const totalProfit = history.reduce((sum, h) => sum + h.profit, 0);
  const profitFactor = 1.34;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignals(prev => 
        prev.map(s => ({
          ...s,
          confidence: Math.min(100, Math.max(60, s.confidence + (Math.random() - 0.5) * 3))
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <header className="border-b border-gray-800 bg-[#1A1F2C]/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#0EA5E9] rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Binarium Signal Pro</h1>
              <p className="text-xs text-gray-400">ML-Powered Trading Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-[#22C55E] text-[#22C55E]">
              <Icon name="Activity" size={14} className="mr-1" />
              Live
            </Badge>
            <Icon name="Settings" size={20} className="text-gray-400 cursor-pointer hover:text-white transition" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#222837] border-gray-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400">Win Rate</CardDescription>
              <CardTitle className="text-3xl text-[#22C55E]">{winRate.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500">{winTrades}/{totalTrades} trades</div>
            </CardContent>
          </Card>

          <Card className="bg-[#222837] border-gray-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400">Profit Factor</CardDescription>
              <CardTitle className="text-3xl text-[#8B5CF6]">{profitFactor}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500">Expected return</div>
            </CardContent>
          </Card>

          <Card className="bg-[#222837] border-gray-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400">Total P/L</CardDescription>
              <CardTitle className={`text-3xl ${totalProfit >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit}$
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500">Last 24h</div>
            </CardContent>
          </Card>

          <Card className="bg-[#222837] border-gray-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400">Active Signals</CardDescription>
              <CardTitle className="text-3xl text-[#0EA5E9]">{activeSignals.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500">Real-time monitoring</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="signals" className="space-y-6">
          <TabsList className="bg-[#222837] border border-gray-800">
            <TabsTrigger value="signals">Активные сигналы</TabsTrigger>
            <TabsTrigger value="charts">Графики</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-4">
            {activeSignals.map((signal, idx) => (
              <Card 
                key={idx} 
                className={`bg-[#222837] border-2 transition-all animate-fade-in ${
                  signal.signal === 'UP' 
                    ? 'border-[#0EA5E9] hover:border-[#0EA5E9]/60' 
                    : 'border-[#F97316] hover:border-[#F97316]/60'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{signal.asset}</CardTitle>
                        <Badge 
                          className={`${
                            signal.signal === 'UP' 
                              ? 'bg-[#0EA5E9] hover:bg-[#0EA5E9]/80' 
                              : 'bg-[#F97316] hover:bg-[#F97316]/80'
                          } text-white`}
                        >
                          <Icon name={signal.signal === 'UP' ? 'TrendingUp' : 'TrendingDown'} size={14} className="mr-1" />
                          {signal.signal}
                        </Badge>
                        <Badge variant="outline" className="border-gray-600">
                          {signal.recommended_expiration}s
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-400">
                        Entry: <span className="text-white font-mono">{signal.entry_price}</span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold mb-1">{signal.confidence}%</div>
                      <div className="text-xs text-gray-400">Confidence</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={signal.confidence} className="mb-4 h-2" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-300">Причины сигнала</h4>
                      <ul className="space-y-1">
                        {signal.reasons.map((reason, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <Icon name="CheckCircle2" size={14} className="text-[#22C55E] mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-300">Индикаторы</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#1A1F2C] p-2 rounded">
                          <div className="text-gray-500">RSI14</div>
                          <div className="font-mono">{signal.indicators.RSI14.toFixed(1)}</div>
                        </div>
                        <div className="bg-[#1A1F2C] p-2 rounded">
                          <div className="text-gray-500">ATR14</div>
                          <div className="font-mono">{signal.indicators.ATR14.toFixed(5)}</div>
                        </div>
                        <div className="bg-[#1A1F2C] p-2 rounded">
                          <div className="text-gray-500">MACD</div>
                          <div className="font-mono">{signal.indicators.MACD_hist.toFixed(5)}</div>
                        </div>
                        <div className="bg-[#1A1F2C] p-2 rounded">
                          <div className="text-gray-500">OB Imbal</div>
                          <div className="font-mono">{signal.indicators.orderbook_imbalance.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400">ML Models:</div>
                    <Badge variant={signal.model_votes.rule_based ? 'default' : 'outline'} className="text-xs">
                      Rules {signal.model_votes.rule_based ? '✓' : '✗'}
                    </Badge>
                    <Badge variant={signal.model_votes.ml_model_1 ? 'default' : 'outline'} className="text-xs">
                      LightGBM {signal.model_votes.ml_model_1 ? '✓' : '✗'}
                    </Badge>
                    <Badge variant={signal.model_votes.ml_model_2 ? 'default' : 'outline'} className="text-xs">
                      LSTM {signal.model_votes.ml_model_2 ? '✓' : '✗'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="charts">
            <Card className="bg-[#222837] border-gray-800">
              <CardHeader>
                <CardTitle>EURUSD - 1m Chart</CardTitle>
                <CardDescription>EMA 8/21/50 + Price Action</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorPrice)" />
                    <Line type="monotone" dataKey="ema8" stroke="#0EA5E9" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ema21" stroke="#F97316" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-[#222837] border-gray-800">
              <CardHeader>
                <CardTitle>История сделок</CardTitle>
                <CardDescription>Последние {history.length} сигналов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((h, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-4 bg-[#1A1F2C] rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={h.signal === 'UP' ? 'bg-[#0EA5E9]' : 'bg-[#F97316]'}>
                          {h.signal}
                        </Badge>
                        <div>
                          <div className="font-semibold">{h.asset}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(h.timestamp).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Confidence</div>
                          <div className="font-semibold">{h.confidence}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Result</div>
                          <Badge variant={h.result === 'WIN' ? 'default' : 'destructive'}>
                            {h.result}
                          </Badge>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="text-xs text-gray-400">P/L</div>
                          <div className={`font-bold ${h.profit >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {h.profit >= 0 ? '+' : ''}{h.profit}$
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
