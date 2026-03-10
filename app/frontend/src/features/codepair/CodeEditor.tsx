import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Socket } from 'socket.io-client';

interface CodeEditorProps {
    socket: Socket;
    roomId: string;
    initialCode: string;
    initialLanguage: string;
}

export const CodeEditor = ({ socket, roomId, initialCode, initialLanguage }: CodeEditorProps) => {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState(initialLanguage);
    const editorRef = useRef<any>(null);

    // Track if the change came from the user typing, or from a socket event
    const isLocalChange = useRef(true);

    useEffect(() => {
        // Hydrate initially if we missed it
        if (initialCode) setCode(initialCode);
        if (initialLanguage) setLanguage(initialLanguage);
    }, [initialCode, initialLanguage]);

    useEffect(() => {
        const handleCodeSync = ({ code: newCode, language: newLang }: { code: string, language: string }) => {
            isLocalChange.current = false;
            setCode(newCode);
            if (newLang && newLang !== language) setLanguage(newLang);
        };

        socket.on('codepair:code-sync', handleCodeSync);

        return () => {
            socket.off('codepair:code-sync', handleCodeSync);
        };
    }, [socket, language]);

    const handleEditorChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);

        // Only emit if the user actually typed it (prevents infinite loop with socket sync)
        if (isLocalChange.current) {
            socket.emit('codepair:code-update', { roomId, code: newCode, language });
        }
        
        // Reset local change flag for next keystroke
        isLocalChange.current = true;
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        socket.emit('codepair:code-update', { roomId, code, language: newLang });
    };

    return (
        <div className="flex flex-col h-full w-full rounded-md border border-neutral-800 focus-within:border-neutral-700 overflow-hidden bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900/50">
                <div className="text-sm font-medium text-neutral-400">Code Editor</div>
                <select 
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-neutral-800 text-neutral-200 text-xs px-2 py-1 rounded border border-neutral-700 focus:outline-none focus:border-neutral-500"
                >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                </select>
            </div>
            <div className="flex-1 w-full relative">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        formatOnPaste: true,
                    }}
                    onMount={(editor) => {
                        editorRef.current = editor;
                    }}
                />
            </div>
        </div>
    );
};
