import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", danger = true, onConfirm, onCancel }: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-danger/10 text-danger" : "bg-purple-accent/10 text-purple-accent"}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{message}</p>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 ${danger ? "bg-danger text-white" : "bg-primary text-primary-foreground"}`}
                        style={!danger ? { color: "var(--background)" } : undefined}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
