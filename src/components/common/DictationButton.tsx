import { Mic, MicOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Lo mínimo de la Web Speech API que se usa (no está en todos los navegadores). */
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'No hay permiso para usar el micrófono. Actívalo en los ajustes del navegador.',
  'service-not-allowed': 'El navegador no permite el dictado en esta página.',
  'no-speech': 'No se escuchó nada. Vuelve a intentarlo.',
  'audio-capture': 'No se encontró un micrófono.',
  network: 'El dictado necesita conexión a internet.',
};

interface Props {
  /** Recibe cada frase reconocida, tal como se dijo. */
  onText: (text: string) => void;
  label?: string;
}

/**
 * Dictado por voz (es-CL) con el reconocimiento del propio navegador: solo
 * escribe las palabras que se dicen, sin reescribirlas. Si el navegador no lo
 * permite, lo dice en vez de fingir.
 */
export function DictationButton({ onText, label = 'Dictar' }: Props) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  useEffect(() => () => recRef.current?.stop(), []);

  const Ctor = typeof window !== 'undefined' ? recognitionCtor() : null;
  if (!Ctor) {
    return <p className="dictation__note">Este navegador no permite dictar por voz.</p>;
  }
  if (!window.isSecureContext) {
    return (
      <p className="dictation__note">
        El dictado por voz necesita una conexión segura (https); funcionará en la versión publicada.
      </p>
    );
  }

  const stop = () => recRef.current?.stop();

  const start = () => {
    setMessage(null);
    const rec = new Ctor();
    rec.lang = 'es-CL';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let partial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript.trim();
        if (!text) continue;
        if (r.isFinal) onTextRef.current(text);
        else partial += `${text} `;
      }
      setInterim(partial.trim());
    };
    rec.onerror = (e) => {
      if (e.error !== 'aborted') setMessage(ERRORS[e.error] ?? 'No se pudo usar el dictado.');
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setMessage('No se pudo iniciar el dictado.');
    }
  };

  return (
    <div className="dictation">
      <button
        type="button"
        className={`btn btn--small ${listening ? 'btn--primary dictation__btn--on' : 'btn--secondary'}`}
        aria-pressed={listening}
        onClick={listening ? stop : start}
      >
        {listening ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
        {listening ? 'Detener' : label}
      </button>
      <span className="dictation__status" aria-live="polite">
        {listening ? interim || 'Escuchando…' : message}
      </span>
    </div>
  );
}
