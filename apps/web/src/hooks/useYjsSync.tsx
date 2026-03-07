'use client';

// FILE: apps/web/src/hooks/useYjsSync.tsx
// Yjs CRDT binding for Monaco editor via y-websocket provider.

import { useEffect, useRef, useState, useCallback } from 'react';
import type * as Monaco from 'monaco-editor';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

interface YjsSyncResult {
  code: string;
  setCode: (v: string) => void;
  editorRef: React.MutableRefObject<Monaco.editor.IStandaloneCodeEditor | null>;
}

export function useYjsSync(roomId: string, language: string): YjsSyncResult {
  const [code, setCodeState] = useState('// Start coding…\n');
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const docRef = useRef<import('yjs').Doc | null>(null);
  const providerRef = useRef<import('y-websocket').WebsocketProvider | null>(null);
  const bindingRef = useRef<import('y-monaco').MonacoBinding | null>(null);
  const isRemote = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    let destroyed = false;

    // Dynamically import heavy Yjs modules to keep initial bundle lean
    Promise.all([
      import('yjs'),
      import('y-websocket'),
      import('y-monaco'),
    ]).then(([{ Doc }, { WebsocketProvider }, { MonacoBinding }]) => {
      if (destroyed) return;

      const doc = new Doc();
      const text = doc.getText('monaco');

      const wsUrl = SOCKET_URL.replace(/^http/, 'ws');
      const provider = new WebsocketProvider(`${wsUrl}/yjs`, roomId, doc);

      const binding = new MonacoBinding(
        text,
        editorRef.current!.getModel()!,
        new Set([editorRef.current!]),
        provider.awareness,
      );

      // Mirror Yjs text back into local state for snapshots / AI
      text.observe(() => {
        isRemote.current = true;
        setCodeState(text.toString());
        isRemote.current = false;
      });

      docRef.current = doc;
      providerRef.current = provider;
      bindingRef.current = binding;
    }).catch(console.error);

    return () => {
      destroyed = true;
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
      docRef.current?.destroy();
    };
  }, [roomId]);

  const setCode = useCallback((v: string) => {
    if (isRemote.current) return;
    const text = docRef.current?.getText('monaco');
    if (text) {
      docRef.current!.transact(() => {
        text.delete(0, text.length);
        text.insert(0, v);
      });
    }
    setCodeState(v);
  }, []);

  void language; // future: switch Yjs doc on language change

  return { code, setCode, editorRef };
}
