import type { RequestItem } from "@/features/requests/store/useRequestsStore";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

interface RequestContext {
  origen: string;
  destino: string;
  solicitante: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Genera el enlace de WhatsApp y abre la ventana de chat.
 * @param items Array de repuestos del carrito
 * @param context Información de contexto (quién pide, para quién)
 * @param phoneNumber Número de destino (formato internacional sin +, ej: 573001234567)
 */
export const sendWhatsAppNotification = (
  items: RequestItem[],
  context: RequestContext,
  phoneNumber: string = "573001234567" // Número por defecto de la Bodega (Cámbialo)
) => {

  // 1. Construir el Encabezado
  let message = `*NUEVA SOLICITUD DE REPUESTOS* 📦\n`;
  message += `--------------------------------\n`;
  message += `📅 *Fecha:* ${new Date().toLocaleDateString()}\n`;
  message += `👤 *Solicita:* ${context.solicitante}\n`;
  message += `📍 *Origen:* ${context.origen}\n`;
  message += `🏭 *Destino:* ${context.destino}\n`;

  message += `--------------------------------\n`;
  message += `*LISTA DE ITEMS:*\n\n`;

  // 2. Iterar items para hacer la lista
  items.forEach((item, index) => {
    message += `${index + 1}. *${item.nombre}*\n`;
    message += `   Ref: ${item.referencia}`;
  });

  message += `\n--------------------------------\n`;
  message += `🔗 _Generado desde App Minca Inventory System_`;

  // 3. Codificar para URL (importante para emojis y saltos de línea)
  const encodedMessage = encodeURIComponent(message);

  // 4. Crear la URL
  // api.whatsapp.com funciona tanto en móvil como en web
  const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

  // 5. Abrir en nueva pestaña
  window.open(url, '_blank');
};
