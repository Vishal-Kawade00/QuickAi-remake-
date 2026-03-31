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
            // Replaced bg-indigo-50 and border-indigo-100
            <div className="flex items-center justify-center my-6 p-8 bg-[#eef2ff] rounded-xl border border-[#e0e7ff]">
                {/* Replaced text-indigo-400 */}
                <div className="flex items-center gap-2 text-[#818cf8]">
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
            // Replaced bg-amber-50 and border-amber-200
            <div className="my-6 p-4 bg-[#fffbeb] border border-[#fde68a] rounded-xl">
                {/* Replaced text-amber-600 */}
                <p className="text-xs font-bold text-[#d97706] uppercase tracking-wide mb-2">
                    ⚠️ Could not render diagram — showing raw syntax
                </p>
                {/* Replaced text-amber-800 */}
                <pre className="text-sm text-[#92400e] font-mono overflow-x-auto whitespace-pre-wrap">
                    {chart}
                </pre>
            </div>
        );
    }

    return (
        // Replaced bg-white and border-indigo-100
        <div className="my-6 p-6 bg-[#ffffff] border border-[#e0e7ff] rounded-xl shadow-sm overflow-x-auto">
            <div
                className="flex justify-center"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
};

export default MermaidDiagram;