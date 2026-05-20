import React from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-xl text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Something went wrong</h2>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                An unexpected crash occurred. Don't worry, your cart and settings are completely safe.
                            </p>
                        </div>

                        {this.state.error?.message && (
                            <pre className="text-xs text-red-500 bg-red-50/50 p-4 rounded-2xl overflow-auto text-left max-h-40 font-mono">
                                {this.state.error.message}
                            </pre>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-6 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/10 cursor-pointer"
                        >
                            <RefreshCw className="h-4 w-4" /> Go to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
