import React, { useEffect, useRef, useState, memo } from "react";
import mermaid from "mermaid";

// ✅ 1. GLOBAL INITIALIZATION: Run once at the module level.
// No need for a custom flag function; this executes immediately when the file is imported.
mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    htmlLabels: false,
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    themeVariables: {
        primaryColor: "#6366f1",
        primaryTextColor: "#1e1b4b",
        primaryBorderColor: "#a5b4fc",
        lineColor: "#6366f1",
        secondaryColor: "#e0e7ff",
        tertiaryColor: "#f5f3ff",
        background: "#ffffff",
        mainBkg: "#eef2ff",
        nodeBorder: "#6366f1",
        clusterBkg: "#f5f3ff",
        titleColor: "#3730a3",
        edgeLabelBackground: "#e0e7ff",
    },
});

// ✅ 2. ENHANCED SANITIZER: Handles non-string edge cases
const sanitizeChart = (chart) => {
    if (typeof chart !== 'string') return ''; // Edge case: chart is undefined/null/object
    return chart
        .replace(/^```mermaid\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/```\s*$/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
};

// Stable ID counter
let idCounter = 0;

const MermaidDiagram = memo(({ chart }) => {
    const [svg, setSvg] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ 3. LAZY REF INITIALIZATION: Prevents ID counter from incrementing on every re-render
    const idRef = useRef(null);
    if (!idRef.current) {
        idRef.current = `mermaid-diagram-${++idCounter}`;
    }

    // ✅ 4. HOOKS ALWAYS RUN: useEffect must come BEFORE any early returns
    useEffect(() => {
        const cleanChart = sanitizeChart(chart);

        // If nothing to render after cleaning, stop loading and abort
        if (!cleanChart) {
            setLoading(false);
            return;
        }

        let cancelled = false; 

        const renderDiagram = async () => {
            try {
                setLoading(true);
                setError(false);

                // Mermaid render
                const { svg: rendered } = await mermaid.render(idRef.current, cleanChart);
                
                if (!cancelled) setSvg(rendered);
            } catch (err) {
                console.error("Mermaid render error:", err);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        renderDiagram();

        // Cleanup stale renders
        return () => { cancelled = true; };
    }, [chart]);

    // ✅ 5. KILL SWITCH: Must be placed AFTER hooks to satisfy React Rules
    if (!chart || chart.trim() === "") return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center my-6 p-8 bg-[#eef2ff] rounded-xl border border-[#e0e7ff]">
                <div className="flex items-center gap-2 text-[#818cf8]">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-sm font-medium">Rendering diagram...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-4 p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl overflow-x-auto shadow-sm">
                <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wide mb-2">
                    Diagram syntax (could not render)
                </p>
                <pre className="text-sm font-mono text-[#374151] whitespace-pre-wrap">
                    {chart}
                </pre>
            </div>
        );
    }

    return (
        <div className="my-6 p-6 bg-[#ffffff] border border-[#e0e7ff] rounded-xl shadow-sm overflow-x-auto">
            <div
                className="flex justify-center mermaid-output"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
});

MermaidDiagram.displayName = "MermaidDiagram";
export default MermaidDiagram;