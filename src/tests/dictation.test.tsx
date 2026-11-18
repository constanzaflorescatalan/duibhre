import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
    render(<DictationButton onText={() => {}} />);
    expect(screen.getByText(/no permite dictar por voz/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dictar/i })).not.toBeInTheDocument();
  });
});
