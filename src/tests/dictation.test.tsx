import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { DictationButton } from '../components/common/DictationButton';
import { appendDictation } from '../utils/dictation';

describe('dictado por voz', () => {
  it('agrega lo dicho tal cual, con espacio y mayúscula al iniciar frase', () => {
    expect(appendDictation('', 'la energía no se crea')).toBe('La energía no se crea');
    expect(appendDictation('La energía no se crea', 'ni se destruye')).toBe(
      'La energía no se crea ni se destruye',
    );
    expect(appendDictation('Fin.', 'otra frase')).toBe('Fin. Otra frase');
    expect(appendDictation('abc', 'defgh', 6)).toBe('abc de');
  });

  it('no finge dictado si el navegador no lo permite', () => {
    render(<DictationButton value="" onChange={() => {}} />);
    expect(screen.getByText(/no permite dictar por voz/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dictar/i })).not.toBeInTheDocument();
  });

  describe('con reconocimiento disponible', () => {
    type Handler = ((e: unknown) => void) | null;
    const instances: { onresult: Handler; onend: (() => void) | null }[] = [];
    const current = () => instances[instances.length - 1];
    class FakeRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      onresult: Handler = null;
      onerror: Handler = null;
      onend: (() => void) | null = null;
      constructor() {
        instances.push(this);
      }
      start() {}
      stop() {
        this.onend?.();
      }
    }
    const w = window as unknown as Record<string, unknown>;

    afterEach(() => {
      delete w.webkitSpeechRecognition;
      Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    });

    function Field() {
      const [text, setText] = useState('Hola.');
      return (
        <>
          <textarea aria-label="Dedicatoria" value={text} onChange={(e) => setText(e.target.value)} />
          <DictationButton value={text} onChange={setText} />
        </>
      );
    }

    const results = (...items: [string, boolean][]) => ({
      resultIndex: 0,
      results: items.map(([t, isFinal]) => ({ isFinal, 0: { transcript: t } })),
    });

    it('escribe en vivo dentro del cuadro mientras se habla', async () => {
      w.webkitSpeechRecognition = FakeRecognition;
      Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
      render(<Field />);
      await userEvent.click(screen.getByRole('button', { name: 'Dictar' }));
      const box = screen.getByRole('textbox', { name: 'Dedicatoria' });

      act(() => current().onresult!(results(['todo vibra', false])));
      expect(box).toHaveValue('Hola. Todo vibra');
      act(() =>
        current().onresult!(results(['todo vibra en distintas frecuencias', true], ['así que', false])),
      );
      expect(box).toHaveValue('Hola. Todo vibra en distintas frecuencias así que');
      expect(screen.queryByText(/así que/, { selector: '.dictation__status' })).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Detener' }));
      expect(screen.getByRole('button', { name: 'Dictar' })).toBeInTheDocument();
    });
  });
});
