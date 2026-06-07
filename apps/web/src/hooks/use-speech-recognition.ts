'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechRecognitionErrorCode =
  | 'not-supported'
  | 'permission-denied'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'unknown';

export type UseSpeechRecognitionReturn = {
  isSupported: boolean;
  isListening: boolean;
  isProcessing: boolean;
  interimTranscript: string;
  finalTranscript: string;
  error: SpeechRecognitionErrorCode | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  clearError: () => void;
};

function getSpeechRecognitionConstructor(): typeof SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function mapNativeError(error: string): SpeechRecognitionErrorCode {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied';
    case 'no-speech':
      return 'no-speech';
    case 'network':
      return 'network';
    case 'aborted':
      return 'aborted';
    default:
      return 'unknown';
  }
}

export function getSpeechRecognitionErrorMessage(
  code: SpeechRecognitionErrorCode | null,
): string | null {
  switch (code) {
    case null:
    case 'aborted':
      return null;
    case 'not-supported':
      return 'Reconhecimento de voz não disponível neste navegador.';
    case 'permission-denied':
      return 'Permissão de microfone negada. Libere o microfone nas configurações do navegador.';
    case 'no-speech':
      return 'Não foi possível entender a fala. Tente novamente.';
    case 'network':
      return 'Erro de rede durante o reconhecimento. Tente novamente.';
    case 'unknown':
      return 'Erro ao reconhecer voz. Tente novamente.';
  }
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<SpeechRecognitionErrorCode | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const intentionalStopRef = useRef(false);
  const interimRef = useRef('');
  const finalRef = useRef('');

  useEffect(() => {
    setIsSupported(!!getSpeechRecognitionConstructor());
  }, []);

  const resetTranscript = useCallback(() => {
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    setIsProcessing(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    intentionalStopRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionClass) {
      setError('not-supported');
      return;
    }

    recognitionRef.current?.abort();

    setError(null);
    setIsProcessing(false);
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    intentionalStopRef.current = false;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (interim) {
        interimRef.current = interim;
        setInterimTranscript(interim);
      }
      if (final) {
        const accumulated = (finalRef.current ? `${finalRef.current} ${final}` : final).trim();
        finalRef.current = accumulated;
        setFinalTranscript(accumulated);
        interimRef.current = '';
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const mapped = mapNativeError(event.error);
      if (mapped === 'aborted' && intentionalStopRef.current) {
        setIsListening(false);
        setIsProcessing(false);
        return;
      }
      if (mapped !== 'aborted') {
        setError(mapped);
      }
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (intentionalStopRef.current) {
        setIsProcessing(false);
        recognitionRef.current = null;
        return;
      }

      const pendingInterim = interimRef.current.trim();
      const accumulatedFinal = finalRef.current.trim();

      if (!accumulatedFinal && pendingInterim) {
        setFinalTranscript(pendingInterim);
        interimRef.current = '';
      }

      setIsProcessing(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError('unknown');
      setIsListening(false);
      setIsProcessing(false);
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isSupported,
    isListening,
    isProcessing,
    interimTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
  };
}
