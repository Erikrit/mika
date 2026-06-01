import { redirect } from 'next/navigation';

/** Rota mantida por compatibilidade; módulo Estudos adiado para v2+ (AD-014). */
export default function StudiesPage() {
  redirect('/');
}
