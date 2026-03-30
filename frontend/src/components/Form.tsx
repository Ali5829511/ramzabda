import React from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

/* ─── Field Wrapper ─────────────────────────────────────────── */
interface FieldProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function Field({ label, error, hint, required, children, className = '' }: FieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
    </div>
  )
}

/* ─── Text Input ────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  icon?: React.ReactNode
  iconEnd?: React.ReactNode
}

export function Input({ error, icon, iconEnd, className = '', ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={`input ${icon ? 'pr-10' : ''} ${iconEnd ? 'pl-10' : ''} ${
          error ? 'border-red-400 focus:ring-red-400' : ''
        } ${className}`}
        {...props}
      />
      {iconEnd && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {iconEnd}
        </span>
      )}
    </div>
  )
}

/* ─── Textarea ──────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`input resize-none ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
      {...props}
    />
  )
}

/* ─── Select ────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`select ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
      {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

/* ─── Checkbox ──────────────────────────────────────────────── */
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input type="checkbox" className="w-4 h-4 accent-primary-600 rounded" {...props} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

/* ─── Form Section ──────────────────────────────────────────── */
interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-100 pb-2">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

/* ─── Submit Button ─────────────────────────────────────────── */
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
}

export function SubmitButton({ loading, loadingText = 'جاري الحفظ...', icon, children, className = '', ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`btn-primary disabled:opacity-60 ${className}`}
      {...props}>
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}

/* ─── Form Status Banner ────────────────────────────────────── */
interface FormStatusProps {
  type: 'success' | 'error'
  message: string
}

export function FormStatus({ type, message }: FormStatusProps) {
  const isSuccess = type === 'success'
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
      isSuccess ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
    }`}>
      {isSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  )
}
