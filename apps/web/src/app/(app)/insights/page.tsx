import { redirect } from 'next/navigation';

/** Rota mantida por compatibilidade; módulo Insights adiado para v2+ (AD-014). */
export default function InsightsPage() {
  redirect('/');
}
