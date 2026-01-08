
import React from 'react';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={classNames(
          "px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all",
          error ? "border-red-500" : "border-slate-300",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...props }) => (
  <label className={classNames("flex items-center gap-2 cursor-pointer", className)}>
    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500" {...props} />
    <span className="text-sm text-slate-700">{label}</span>
  </label>
);
