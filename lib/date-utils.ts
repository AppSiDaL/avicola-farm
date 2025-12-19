/**
 * Utilidades para manejo de fechas con zona horaria correcta
 * 
 * El problema: Cuando usamos new Date().toISOString(), JavaScript convierte
 * la fecha a UTC. Esto causa que una fecha como "2024-12-18 23:00" en México (UTC-6)
 * se convierta a "2024-12-19 05:00" en UTC, resultando en la fecha incorrecta.
 * 
 * Solución: Usar funciones que trabajen con la zona horaria local.
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria local
 */
export function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte un objeto Date a string YYYY-MM-DD usando la zona horaria local
 */
export function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parsea una fecha de la base de datos y la formatea para el input date
 * Evita problemas de zona horaria parseando la fecha directamente
 */
export function formatDateForInput(dateValue: string | Date): string {
  if (!dateValue) return '';
  
  if (typeof dateValue === 'string') {
    // Si ya viene como string YYYY-MM-DD, usarla directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    // Si viene como ISO string o con tiempo, extraer solo la parte de fecha
    // Parsear los componentes directamente para evitar conversión de zona horaria
    const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }
  
  // Si es un objeto Date, usar zona horaria local
  if (dateValue instanceof Date) {
    return dateToLocalString(dateValue);
  }
  
  // Fallback: parsear y convertir
  const date = new Date(dateValue);
  return dateToLocalString(date);
}

/**
 * Formatea una fecha para mostrar al usuario
 */
export function formatDateForDisplay(dateValue: string | Date, locale = 'es-MX'): string {
  if (!dateValue) return '';
  
  // Parsear la fecha en UTC para evitar conversiones de zona horaria
  let date: Date;
  if (typeof dateValue === 'string') {
    // Añadir T12:00:00 para evitar que la fecha se desplace por zona horaria
    const dateOnly = dateValue.split('T')[0];
    date = new Date(`${dateOnly}T12:00:00`);
  } else {
    date = dateValue;
  }
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}
