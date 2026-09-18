'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { TextField } from './TextField';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  labelAction?: React.ReactNode;
  hint?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  error,
  labelAction,
  hint,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      autoComplete={autoComplete}
      error={error}
      labelAction={labelAction}
      hint={hint}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="rounded-md p-2 text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {visible ? (
            <EyeOffIcon aria-hidden="true" className="h-4 w-4" />
          ) : (
            <EyeIcon aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      }
    />
  );
}
