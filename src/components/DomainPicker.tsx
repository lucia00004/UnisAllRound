import React from 'react';
import { CustomPicker } from './CustomPicker';

export function DomainPicker({
  label,
  value,
  onSelect,
  required,
  lang,
  disabled,
}: {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  required?: boolean;
  lang: 'IT' | 'EN';
  disabled?: boolean;
}) {
  const domains = [
    'Area Didattica',
    'Servizi agli Studenti',
    'Terza Missione',
    'Risorse Umane',
    'Bibliotecario',
    'Ufficio Stampa',
    'Funzionario Amministrativo',
    'Tecnico di Laboratiorio (IT)',
    'Tecnico di Laboratio(CTF)',
    'Addetto Mensa',
  ];
  return (
    <CustomPicker
      label={label}
      value={value}
      options={domains}
      onSelect={onSelect}
      required={required}
      lang={lang}
      disabled={disabled}
      placeholder={lang === 'IT' ? 'Seleziona ambito...' : 'Select work scope...'}
    />
  );
}
