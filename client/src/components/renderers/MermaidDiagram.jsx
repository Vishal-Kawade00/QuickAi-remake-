import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    themeVariables: {
        primaryColor: '#6366f1',
        primaryTextColor: '#1e1b4b',
        primaryBorderColor: '#a5b4fc',
        lineColor: '#6366f1',
        secondaryColor: '#e0e7ff',
        tertiaryColor: '#f5f3ff',
        background: '#ffffff',
        mainBkg: '#eef2ff',
        nodeBorder: '#6366f1',
        clusterBkg: '#f5f3ff',
        titleColor: '#3730a3',
        edgeLabelBackground: '#e0e7ff',
    },
});

const MermaidDiagram = ({ chart }) => {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Using slice instead of substr to keep strict linters happy
    const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 11)}`);

    useEffect(() => {
        if (!chart) return;

        const render = async () => {
            try {
                setLoading(true);
                setError(false);
                const { svg: rendered } = await mermaid.render(idRef.current, chart);
                setSvg(rendered);
            } catch (err) {
                console.error('Mermaid render error:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        render();
    }, [chart]);

    if (loading) {
        return (
            <div className="flex items-center justify-center my-6 p-8 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-400">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <span className="text-sm font-medium">Rendering diagram...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
                    ⚠️ Could not render diagram — showing raw syntax
                </p>
                <pre className="text-sm text-amber-800 font-mono overflow-x-auto whitespace-pre-wrap">
                    {chart}
                </pre>
            </div>
        );
    }

    return (
        <div className="my-6 p-6 bg-white border border-indigo-100 rounded-xl shadow-sm overflow-x-auto">
            <div
                className="flex justify-center"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
};

export default MermaidDiagram;