import { redirect } from 'next/navigation';

/** Rota mantida por compatibilidade; objetivos consolidados em Projetos (AD-016). */
export default function GoalsPage() {
  redirect('/projects');
}
