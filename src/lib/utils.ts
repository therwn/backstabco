import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Para birimi formatı
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'SILVER',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('SILVER', '').trim() + ' gümüş'
}

// Input için para birimi formatı (sadece sayılar)
export function formatCurrencyInput(value: string): string {
  // Sadece sayıları al
  const numbers = value.replace(/[^\d]/g, '')
  return numbers
}

// Para birimi input'u için parse fonksiyonu
export function parseCurrencyInput(value: string): number {
  return parseInt(value.replace(/[^\d]/g, '')) || 0
}

export function generateTableId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
