// src/lib/utils.ts — Cálculos de negocio NutriMesh

import type { Batch, BusinessRules, BatchType } from './types';
import { DEFAULT_RULES } from './types';

/** Kilogramos estimados dado el número de bandejas */
export function estimateKg(trays: number, rules: BusinessRules = DEFAULT_RULES): number {
  return +(trays * rules.kgPerTray).toFixed(1);
}

/** Raciones estimadas a partir de kg */
export function estimateRations(kg: number, rules: BusinessRules = DEFAULT_RULES): number {
  return Math.floor(kg / rules.kgPerRation);
}

/** CO2e evitado estimado en kg */
export function estimateCO2(kg: number, rules: BusinessRules = DEFAULT_RULES): number {
  return +(kg * rules.co2PerKg).toFixed(1);
}

/**
 * Calcula la fecha de vencimiento de la ventana de inocuidad.
 * SIEMPRE usa la fecha de creación del lote (serverTimestamp) como referencia,
 * nunca new Date() local, para evitar discrepancias de zona horaria en el teléfono del chofer.
 * Santo Domingo opera en AST (UTC-4), sin horario de verano.
 */
export function calcExpiresAt(createdAt: Date, type: BatchType, rules: BusinessRules = DEFAULT_RULES): Date {
  const hours = type === 'hot' ? rules.hotWindowHours : rules.coldWindowHours;
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
}

/** Tiempo restante formateado hasta una fecha */
export function formatTimeLeft(expiresAt: Date): { label: string; urgency: 'ok' | 'warn' | 'urgent' } {
  const diffMs = expiresAt.getTime() - Date.now();
  if (diffMs <= 0) return { label: 'Vencido', urgency: 'urgent' };

  const diffH = diffMs / (1000 * 60 * 60);
  const diffM = Math.floor(diffMs / (1000 * 60));

  let urgency: 'ok' | 'warn' | 'urgent' = 'ok';
  if (diffH < 1) urgency = 'urgent';
  else if (diffH < 2) urgency = 'warn';

  if (diffM < 60) return { label: `${diffM} min`, urgency };
  const h = Math.floor(diffH);
  const m = Math.floor((diffH - h) * 60);
  return { label: m > 0 ? `${h}h ${m}m` : `${h}h`, urgency };
}

/** Verifica si la temperatura es válida para el tipo de lote */
export function isTempValid(temp: number, type: BatchType, rules: BusinessRules = DEFAULT_RULES): boolean {
  if (type === 'hot') return temp >= rules.hotMinTemp;
  return temp <= rules.coldMaxTemp;
}

/** Genera un token aleatorio para el link del chofer */
export function generateDriverToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  // Usamos crypto.getRandomValues si está disponible
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    token += chars[byte % chars.length];
  }
  return token;
}

/** Arma el URL del link del chofer */
export function buildDriverUrl(token: string): string {
  return `${window.location.origin}/c/${token}`;
}

/** Arma el mensaje de WhatsApp prellenado */
export function buildWhatsAppUrl(batch: Batch, driverUrl: string): string {
  const lines = [
    `*NutriMesh - Recogida confirmada*`,
    `Hotel: ${batch.hotelName ?? batch.hotelId}`,
    `Categoría: ${batch.category}`,
    `Bandejas: ${batch.trays} (~${batch.estimatedKg} kg)`,
    `Tipo: ${batch.type === 'hot' ? 'Caliente' : 'Frío'}`,
    ``,
    `Tu link para documentar la recogida:`,
    driverUrl,
    ``,
    `_Pulsa el link antes de llegar al hotel._`,
  ];
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/?text=${text}`;
}

/** Formatea un número con separador de miles */
export function fmtNum(n: number, decimals = 0): string {
  return n.toLocaleString('es-DO', { maximumFractionDigits: decimals });
}

/** Formatea fecha corta en AST */
export function fmtDate(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
