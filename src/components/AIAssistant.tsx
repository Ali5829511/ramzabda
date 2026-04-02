import { useState, useRef, useEffect } from 'react';
import { useStore } from '../data/store';
import type { AppState } from '../data/store';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

function getTime() {
  return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function buildContext(store: AppState) {
  const { properties, units, contracts, invoices, maintenanceRequests, customers, appointments } = store;
  const today = new Date();
  const totalRevenue = invoices.filter((i: AppState['invoices'][0]) => i.invoiceStatus === 'paid').reduce((s: number, i: AppState['invoices'][0]) => s + i.paidAmount, 0);
  const overdueRev = invoices.filter((i: AppState['invoices'][0]) => i.invoiceStatus === 'overdue').reduce((s: number, i: AppState['invoices'][0]) => s + i.remainingAmount, 0);
  const occupancyRate = units.length ? Math.round((units.filter((u: AppState['units'][0]) => u.unitStatus === 'rented').length / units.length) * 100) : 0;
  const openMaint = maintenanceRequests.filter((m: AppState['maintenanceRequests'][0]) => m.status !== 'completed' && m.status !== 'cancelled').length;
  const expiring30 = contracts.filter((c: AppState['contracts'][0]) => {
    const d = new Date(c.contractEndDate);
    return c.status === 'active' && d >= today && (d.getTime() - today.getTime()) / 86400000 <= 30;
  }).length;
  return { properties: properties.length, units: units.length, occupancyRate, totalRevenue, overdueRev, openMaint, expiring30, customers: customers.length, appointments: appointments.length };
}

function generateReply(input: string, ctx: ReturnType<typeof buildContext>): string {
  const q = input.toLowerCase().trim();

  if (q.includes('إشغال') || q.includes('وحدة') || q.includes('مؤجر')) {
    return `نسبة الإشغال الحالية **${ctx.occupancyRate}%** من إجمالي **${ctx.units}** وحدة. ${ctx.occupancyRate >= 80 ? '✅ أداء ممتاز!' : ctx.occupancyRate >= 60 ? '⚠️ يمكن تحسينها بحملة تسويقية.' : '🔴 تحتاج إجراءات تسويقية عاجلة.'}`;
  }
  if (q.includes('إيراد') || q.includes('مالي') || q.includes('تحصيل')) {
    return `إجمالي المحصّل: **${ctx.totalRevenue.toLocaleString('ar-SA')} ر.س**\nالمتأخر: **${ctx.overdueRev.toLocaleString('ar-SA')} ر.س**\n${ctx.overdueRev > 0 ? '⚠️ يُنصح بمتابعة المستأجرين المتأخرين فوراً.' : '✅ التحصيل في الوضع الجيد.'}`;
  }
  if (q.includes('عقد') || q.includes('ينتهي') || q.includes('تجديد')) {
    return `**${ctx.expiring30}** عقد ينتهي خلال 30 يوماً. ${ctx.expiring30 > 0 ? '📋 يُنصح بالتواصل مع المستأجرين لتجديد العقود قبل الانتهاء.' : '✅ لا توجد عقود تنتهي قريباً.'}`;
  }
  if (q.includes('صيانة') || q.includes('بلاغ')) {
    return `البلاغات المفتوحة: **${ctx.openMaint}** بلاغ. ${ctx.openMaint > 5 ? '🔧 الحمل مرتفع — يُنصح بتعيين فنيين إضافيين.' : ctx.openMaint > 0 ? '🔧 تحقق من البلاغات العاجلة أولاً.' : '✅ لا توجد بلاغات مفتوحة.'}`;
  }
  if (q.includes('عقار') || q.includes('كم عقار')) {
    return `لديك **${ctx.properties}** عقار مسجل في المنصة بإجمالي **${ctx.units}** وحدة.`;
  }
  if (q.includes('عميل') || q.includes('crm')) {
    return `لديك **${ctx.customers}** عميل في نظام CRM. يمكن استعراضهم من قسم "إدارة العملاء".`;
  }
  if (q.includes('موعد') || q.includes('زيارة')) {
    return `لديك **${ctx.appointments}** موعد مسجل. يمكن إدارة المواعيد من قسم "التسويق العقاري ← المواعيد والزيارات".`;
  }
  if (q.includes('مرحب') || q.includes('أهل') || q.includes('مساء') || q.includes('صباح')) {
    return `أهلاً وسهلاً! 👋 أنا مساعدك الذكي في منصة رمز الإبداع لإدارة الأملاك.\n\nيمكنني مساعدتك في:\n• تحليل بيانات العقارات والإيرادات\n• متابعة العقود والمتأخرات\n• حالة الصيانة والبلاغات\n• نصائح لتحسين الأداء\n\nماذا تريد أن تعرف؟`;
  }
  if (q.includes('نصيحة') || q.includes('تحسين') || q.includes('اقتراح')) {
    const tips = [];
    if (ctx.occupancyRate < 80) tips.push(`• نسبة الإشغال ${ctx.occupancyRate}% — ابدأ حملة تسويقية للوحدات الشاغرة`);
    if (ctx.overdueRev > 0) tips.push(`• لديك ${ctx.overdueRev.toLocaleString('ar-SA')} ر.س متأخرة — تواصل مع المستأجرين`);
    if (ctx.expiring30 > 0) tips.push(`• ${ctx.expiring30} عقد ينتهي قريباً — جاهز للتجديد؟`);
    if (ctx.openMaint > 3) tips.push(`• ${ctx.openMaint} بلاغ صيانة مفتوح — تابعها لتحسين رضا المستأجرين`);
    return tips.length > 0 ? `**توصياتي لك اليوم:**\n${tips.join('\n')}` : '✅ أداء ممتاز! جميع مؤشراتك في الوضع الجيد.';
  }
  if (q.includes('ملخص') || q.includes('تقرير') || q.includes('كيف الحال')) {
    return `**ملخص سريع 📊**\n• العقارات: ${ctx.properties} | الوحدات: ${ctx.units}\n• الإشغال: ${ctx.occupancyRate}%\n• المحصّل: ${ctx.totalRevenue.toLocaleString('ar-SA')} ر.س\n• المتأخر: ${ctx.overdueRev.toLocaleString('ar-SA')} ر.س\n• الصيانة المفتوحة: ${ctx.openMaint} بلاغ\n• عقود تنتهي قريباً: ${ctx.expiring30}`;
  }

  return `شكراً على سؤالك. يمكنني مساعدتك في تحليل:\n• **الإيرادات والتحصيل** — اسألني "كيف الإيرادات؟"\n• **الإشغال** — اسألني "ما نسبة الإشغال؟"\n• **العقود** — اسألني "كم عقد ينتهي؟"\n• **الصيانة** — اسألني "كم بلاغ مفتوح؟"\n• **نصائح** — اسألني "أعطني نصيحة"`;
}

export default function AIAssistant() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant', time: getTime(),
    text: 'أهلاً! 👋 أنا مساعدك الذكي في رمز الإبداع. اسألني عن الإيرادات، الإشغال، العقود، أو الصيانة!',
  }]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, time: getTime() }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const ctx = buildContext(store);
    const reply = generateReply(text, ctx);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: reply, time: getTime() }]);
    setTyping(false);
  };

  const SUGGESTIONS = ['ما نسبة الإشغال؟', 'كيف الإيرادات؟', 'كم عقد ينتهي؟', 'أعطني نصيحة'];

  function renderText(text: string) {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
            : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group">
        <Bot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
        <div className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          المساعد الذكي
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all ${minimized ? 'h-14 w-72' : 'w-80 h-[500px]'}`} dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-l from-yellow-500 to-amber-600 text-white rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-sm">المساعد الذكي</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-300 rounded-full" />
              <span className="text-xs text-yellow-100">متاح الآن</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center shrink-0 ml-2 mt-1">
                    <Sparkles className="w-3 h-3 text-yellow-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-yellow-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {renderText(msg.text)}
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-yellow-200' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center ml-2 shrink-0">
                  <Sparkles className="w-3 h-3 text-yellow-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 pb-2">
            <div className="flex gap-1.5 flex-wrap">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-full hover:bg-yellow-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-gray-50"
                placeholder="اسأل أي شيء..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <button onClick={send} disabled={!input.trim() || typing}
                className="w-9 h-9 bg-yellow-500 text-white rounded-xl flex items-center justify-center hover:bg-yellow-600 transition-colors disabled:opacity-40 shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
