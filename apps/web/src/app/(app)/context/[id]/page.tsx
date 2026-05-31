'use client';

import { use } from 'react';
import { DocumentEditor } from '@/components/context/document-editor';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ContextDocumentPage({ params }: Props) {
  const { id } = use(params);
  return <DocumentEditor documentId={id} />;
}
