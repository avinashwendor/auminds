'use client';

import Editor from '@monaco-editor/react';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { FileCode2, FolderOpen, Play, Plus, Square, TerminalSquare, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type WorkspaceFile = {
  name: string;
  language: string;
  content: string;
};

type RuntimeWindow = Window & {
  __aumindsWebContainer?: Promise<WebContainer>;
};

const INITIAL_FILES: WorkspaceFile[] = [
  {
    name: 'index.js',
    language: 'javascript',
    content: `const message = 'Hello from Node.js in your browser!';

console.log(message);
console.log('Node version:', process.version);
`,
  },
  {
    name: 'package.json',
    language: 'json',
    content: `{
  "name": "auminds-browser-workspace",
  "private": true,
  "scripts": {
    "start": "node index.js"
  }
}
`,
  },
];

function getRuntime() {
  const runtimeWindow = window as RuntimeWindow;
  if (!runtimeWindow.__aumindsWebContainer) {
    runtimeWindow.__aumindsWebContainer = import('@webcontainer/api').then(({ WebContainer }) =>
      WebContainer.boot({ coep: 'require-corp' }),
    );
  }
  return runtimeWindow.__aumindsWebContainer;
}

function toFileTree(files: WorkspaceFile[]) {
  return Object.fromEntries(
    files.map((file) => [file.name, { file: { contents: file.content } }]),
  );
}

function languageFromName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase();
  const languages: Record<string, string> = {
    cjs: 'javascript',
    css: 'css',
    html: 'html',
    js: 'javascript',
    json: 'json',
    jsx: 'javascript',
    md: 'markdown',
    mjs: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
  };
  return languages[extension ?? ''] ?? 'plaintext';
}

function parseCommand(value: string) {
  return (value.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((part) =>
    part.replace(/^"|"$/g, ''),
  );
}

export default function BrowserCodeEditor() {
  const [files, setFiles] = useState<WorkspaceFile[]>(INITIAL_FILES);
  const [activeName, setActiveName] = useState(INITIAL_FILES[0].name);
  const [runtime, setRuntime] = useState<WebContainer | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<'booting' | 'ready' | 'error'>('booting');
  const [terminal, setTerminal] = useState('Booting the browser Node.js runtime…\n');
  const [command, setCommand] = useState('npm run start');
  const [running, setRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const processRef = useRef<WebContainerProcess | null>(null);
  const terminalRef = useRef<HTMLPreElement | null>(null);

  const activeFile = useMemo(
    () => files.find((file) => file.name === activeName) ?? files[0],
    [activeName, files],
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void getRuntime()
      .then(async (container) => {
        await container.mount(toFileTree(INITIAL_FILES));
        if (cancelled) return;
        unsubscribe = container.on('server-ready', (_port, url) => setPreviewUrl(url));
        setRuntime(container);
        setRuntimeStatus('ready');
        setTerminal('Node.js is ready. Run the active file or enter an npm/node command.\n');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setRuntimeStatus('error');
        setTerminal(`Runtime failed to start: ${error instanceof Error ? error.message : String(error)}\n`);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight });
  }, [terminal]);

  const appendTerminal = (value: string) => {
    setTerminal((current) => current + value);
  };

  const saveFile = async (file: WorkspaceFile) => {
    await runtime?.fs.writeFile(file.name, file.content);
  };

  const updateActiveFile = (content: string) => {
    const nextFile = { ...activeFile, content };
    setFiles((current) => current.map((file) => (file.name === activeName ? nextFile : file)));
    void saveFile(nextFile);
  };

  const execute = async (executable: string, args: string[]) => {
    if (!runtime || running) return;
    setRunning(true);
    appendTerminal(`\n$ ${[executable, ...args].join(' ')}\n`);

    try {
      await saveFile(activeFile);
      const process = await runtime.spawn(executable, args);
      processRef.current = process;
      const output = process.output.pipeTo(
        new WritableStream<string>({ write: appendTerminal }),
      );
      const exitCode = await process.exit;
      await output;
      appendTerminal(`\nProcess exited with code ${exitCode}.\n`);
    } catch (error) {
      appendTerminal(`\n${error instanceof Error ? error.message : String(error)}\n`);
    } finally {
      processRef.current = null;
      setRunning(false);
    }
  };

  const runActiveFile = () => {
    if (!activeFile) return;
    if (!/\.(?:cjs|js|mjs)$/.test(activeFile.name)) {
      appendTerminal('\nRun file currently supports Node.js JavaScript files. Use an npm command for project scripts.\n');
      return;
    }
    void execute('node', [activeFile.name]);
  };

  const runCommand = () => {
    const [executable, ...args] = parseCommand(command.trim());
    if (executable) void execute(executable, args);
  };

  const stopProcess = () => {
    processRef.current?.kill();
    appendTerminal('\nProcess stopped.\n');
  };

  const addFile = () => {
    const name = window.prompt('File name (for example, server.js)')?.trim();
    if (!name || files.some((file) => file.name === name)) return;
    const file = { name, language: languageFromName(name), content: '' };
    setFiles((current) => [...current, file]);
    setActiveName(name);
    void runtime?.fs.writeFile(name, '');
  };

  const deleteActiveFile = () => {
    if (files.length === 1 || !activeFile) return;
    const nextFiles = files.filter((file) => file.name !== activeFile.name);
    setFiles(nextFiles);
    setActiveName(nextFiles[0].name);
    void runtime?.fs.rm(activeFile.name);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#0B0F17] text-white">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#10151d] px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center bg-[#00AB55] text-[#07110c]">
            <FileCode2 className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">AUMINDS Code Editor</h1>
            <p className="font-mono text-[11px] text-[#919EAB]">Node.js runs locally in this browser tab</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`size-2 rounded-full ${runtimeStatus === 'ready' ? 'bg-[#00AB55]' : runtimeStatus === 'error' ? 'bg-red-500' : 'animate-pulse bg-amber-400'}`}
            aria-hidden="true"
          />
          <span className="font-mono text-[#919EAB]">
            {runtimeStatus === 'ready' ? 'Runtime ready' : runtimeStatus === 'error' ? 'Runtime unavailable' : 'Booting runtime'}
          </span>
          <button
            type="button"
            onClick={runActiveFile}
            disabled={runtimeStatus !== 'ready' || running}
            className="ml-3 inline-flex h-9 items-center gap-2 bg-[#00AB55] px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="size-4" aria-hidden="true" />
            Run file
          </button>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#10151d] lg:border-b-0 lg:border-r">
          <div className="flex h-11 items-center justify-between border-b border-white/10 px-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#919EAB]">
              <FolderOpen className="size-4" aria-hidden="true" /> Explorer
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={addFile} className="p-1.5 text-[#919EAB] hover:bg-white/10 hover:text-white" aria-label="Add file">
                <Plus className="size-4" />
              </button>
              <button type="button" onClick={deleteActiveFile} disabled={files.length === 1} className="p-1.5 text-[#919EAB] hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Delete active file">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <nav aria-label="Workspace files" className="py-2">
            {files.map((file) => (
              <button
                type="button"
                key={file.name}
                onClick={() => setActiveName(file.name)}
                className={`flex w-full items-center gap-2 border-l-2 px-3 py-2 text-left font-mono text-xs ${file.name === activeName ? 'border-[#00AB55] bg-white/[0.06] text-white' : 'border-transparent text-[#919EAB] hover:bg-white/[0.04] hover:text-white'}`}
              >
                <FileCode2 className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="grid min-h-[calc(100vh-3.5rem)] grid-rows-[minmax(340px,3fr)_minmax(230px,2fr)]">
          <section aria-label="Code editor" className="min-h-0 bg-[#0d1117]">
            <div className="flex h-10 items-center border-b border-white/10 bg-[#10151d] px-4 font-mono text-xs text-white">
              {activeFile.name}
            </div>
            <div className="h-[calc(100%-2.5rem)]">
              <Editor
                height="100%"
                language={activeFile.language}
                path={activeFile.name}
                theme="vs-dark"
                value={activeFile.content}
                onChange={(value) => updateActiveFile(value ?? '')}
                options={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  minimap: { enabled: true },
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </section>

          <section aria-label="Terminal" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] border-t border-white/10 bg-[#090d12]">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#10151d] p-2">
              <span className="mr-2 inline-flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-[#919EAB]">
                <TerminalSquare className="size-4" aria-hidden="true" /> Terminal
              </span>
              <input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') runCommand();
                }}
                aria-label="Terminal command"
                spellCheck={false}
                className="h-8 min-w-48 flex-1 border border-white/10 bg-[#090d12] px-3 font-mono text-xs text-white outline-none focus:border-[#00AB55]"
                placeholder="npm install package-name"
              />
              <button
                type="button"
                onClick={runCommand}
                disabled={runtimeStatus !== 'ready' || running}
                className="inline-flex h-8 items-center gap-2 bg-white/10 px-3 text-xs font-bold hover:bg-white/15 disabled:opacity-40"
              >
                <Play className="size-3.5" aria-hidden="true" /> Run
              </button>
              <button
                type="button"
                onClick={stopProcess}
                disabled={!running}
                className="inline-flex h-8 items-center gap-2 bg-red-500/15 px-3 text-xs font-bold text-red-300 hover:bg-red-500/25 disabled:opacity-30"
              >
                <Square className="size-3.5" aria-hidden="true" /> Stop
              </button>
              <button type="button" onClick={() => setTerminal('')} className="h-8 px-3 text-xs text-[#919EAB] hover:bg-white/10 hover:text-white">
                Clear
              </button>
            </div>
            <div className={`grid min-h-0 ${previewUrl ? 'md:grid-cols-2' : ''}`}>
              <pre ref={terminalRef} className="min-h-0 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-[#d7e0ea]">
                {terminal || 'Terminal cleared.\n'}
              </pre>
              {previewUrl && (
                <iframe
                  title="Application preview"
                  src={previewUrl}
                  className="h-full min-h-56 w-full border-l border-white/10 bg-white"
                  sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
                />
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
