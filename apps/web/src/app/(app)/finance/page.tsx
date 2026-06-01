import { redirect } from 'next/navigation';

/** Rota mantida por compatibilidade; módulo Finanças adiado para v2/v3 (AD-013). */
export default function FinancePage() {
  redirect('/');
}
