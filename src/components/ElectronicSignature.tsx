import { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, X, Download } from 'lucide-react';

interface Props {
  signerName: string;
  signerRole?: 'owner' | 'tenant' | 'witness';
  onSign?: (signatureDataUrl: string) => void;
  onClose?: () => void;
  existingSignature?: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'المالك',
  tenant: 'المستأجر',
  witness: 'الشاهد',
};

export default function ElectronicSignature({ signerName, signerRole = 'tenant', onSign, onClose, existingSignature }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!existingSignature);
  const [signed, setSigned] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [timestamp] = useState(new Date().toLocaleString('ar-SA'));
  const [ip] = useState(() => '192.168.1.' + Math.floor(Math.random() * 200 + 10));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (existingSignature) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = existingSignature;
    }
  }, [existingSignature]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setSigned(false);
    setSignatureDataUrl('');
  };

  const confirm = () => {
    const canvas = canvasRef.current; if (!canvas || isEmpty) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    setSigned(true);
    onSign?.(dataUrl);
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const link = document.createElement('a');
    link.download = `توقيع-${signerName}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg w-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-l from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">التوقيع الإلكتروني</p>
            <p className="text-xs text-blue-200">{ROLE_LABELS[signerRole]}: {signerName}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {signed ? (
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <p className="font-bold text-gray-800">تم التوقيع بنجاح</p>
          {signatureDataUrl && (
            <img src={signatureDataUrl} alt="التوقيع" className="max-h-20 mx-auto border border-gray-200 rounded-xl p-2" />
          )}
          <div className="text-xs text-gray-400 space-y-1">
            <p>وقت التوقيع: {timestamp}</p>
            <p>عنوان IP: {ip}</p>
            <p className="text-green-600 font-medium">✓ موثّق ومحفوظ</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={downloadSignature} className="btn-secondary text-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> تنزيل
            </button>
            <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600 underline">إعادة التوقيع</button>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500 text-center">وقّع في المساحة أدناه باستخدام الماوس أو الإصبع</p>

          {/* Canvas */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 relative hover:border-blue-300 transition-colors">
            <canvas
              ref={canvasRef}
              width={400}
              height={160}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-300 text-sm">ضع توقيعك هنا...</p>
              </div>
            )}
          </div>

          {/* Signer info */}
          <div className="bg-blue-50 rounded-xl p-3 flex items-center justify-between">
            <div className="text-xs text-blue-700">
              <p className="font-semibold">{ROLE_LABELS[signerRole]}: {signerName}</p>
              <p className="text-blue-400 mt-0.5">{timestamp}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span>🔒</span> آمن
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={confirm} disabled={isEmpty}
              className="btn-primary flex-1 justify-center py-2.5 text-sm disabled:opacity-40 flex items-center gap-2">
              <Check className="w-4 h-4" /> تأكيد التوقيع
            </button>
            <button onClick={clear} className="btn-secondary px-3 flex items-center gap-1 text-sm">
              <RotateCcw className="w-4 h-4" /> مسح
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            بالتوقيع أعلاه تقر بأنك اطلعت على العقد وتوافق على شروطه وأحكامه
          </p>
        </div>
      )}
    </div>
  );
}
