// Editor Integration - Handles Monaco Editor
console.log("Editor Integration Loaded");

require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    window.editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: '// Start coding your solution here...\n\nfunction solve() {\n\t\n}',
        language: 'javascript',
        theme: 'vs-dark', // We will customize this later
        fontFamily: 'Fira Code',
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 20 }
    });
});
