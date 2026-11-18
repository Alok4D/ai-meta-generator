"use client";

import React, { useState } from "react";
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, Trash2, ShieldCheck, RefreshCw, Eye, EyeOff } from "lucide-react";
import { ApifyKeyRecord } from "./types";

interface ApiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    keys: ApifyKeyRecord[];
    selectedKeyId: string | null;
    onSelectKey: (id: string) => void;
    onAddKey: (key: ApifyKeyRecord) => void;
    onDeleteKey: (id: string) => void;
    onUpdateKey: (key: ApifyKeyRecord) => void;
}

export default function ApiSettingsModal({
    isOpen,
    onClose,
    keys,
    selectedKeyId,
    onSelectKey,
    onAddKey,
    onDeleteKey,
    onUpdateKey
}: ApiSettingsModalProps) {
    const [tokenInput, setTokenInput] = useState("");
    const [labelInput, setLabelInput] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleVerifyAndSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = tokenInput.trim();
        if (!trimmed) {
            setVerifyError("Please enter your Apify API key.");
            return;
        }

        setIsVerifying(true);
        setVerifyError(null);
        setVerifySuccess(null);

        try {
            const res = await fetch("/api/adobe-tracker/verify-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: trimmed })
            });

            const data = await res.json();

            if (!res.ok || !data.valid) {
                throw new Error(data.error || "Failed to verify Apify API key");
            }

            const newKey: ApifyKeyRecord = {
                id: Date.now().toString(),
                token: trimmed,
                label: labelInput.trim() || data.username || "Apify Key",
                username: data.username,
                plan: data.plan,
                monthlyCredits: data.monthlyCredits,
                health: 'active',
                verifiedAt: new Date().toISOString()
            };

            onAddKey(newKey);
            setVerifySuccess(`Connected as @${data.username} (${data.plan} tier)`);
            setTokenInput("");
            setLabelInput("");
        } catch (err: any) {
            setVerifyError(err.message || "Invalid Apify token");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleTestKey = async (key: ApifyKeyRecord) => {
        try {
            const res = await fetch("/api/adobe-tracker/verify-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: key.token })
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                onUpdateKey({
                    ...key,
                    username: data.username,
                    plan: data.plan,
                    health: 'active',
                    verifiedAt: new Date().toISOString()
                });
            } else {
                onUpdateKey({ ...key, health: 'invalid' });
            }
        } catch (_) {
            onUpdateKey({ ...key, health: 'invalid' });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Key className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-base">Apify API Settings</h3>
                            <p className="text-xs text-muted-foreground">Manage your Apify connection for Adobe Stock tracking</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Info Note */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground">Free & Private: </span>
                            Keys are stored securely in your browser and used to run the Adobe Stock tracker directly. 
                            Get your free personal token from{" "}
                            <a
                                href="https://console.apify.com/settings/integrations"
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                            >
                                Apify Integrations <ExternalLink className="w-3 h-3" />
                            </a>.
                        </div>
                    </div>

                    {/* Saved Keys List */}
                    {keys.length > 0 && (
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                Saved API Keys ({keys.length})
                            </label>
                            <div className="space-y-2">
                                {keys.map((k) => {
                                    const isSelected = k.id === selectedKeyId;
                                    return (
                                        <div
                                            key={k.id}
                                            onClick={() => onSelectKey(k.id)}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                    ? "bg-primary/10 border-primary text-foreground shadow-sm"
                                                    : "bg-muted/40 border-border/60 hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                    k.health === 'active' ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-rose-500"
                                                }`} />
                                                <div className="truncate">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-foreground truncate">{k.label}</span>
                                                        {k.username && (
                                                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                                @{k.username}
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                                        {k.token ? `${k.token.slice(0, 10)}...${k.token.slice(-4)}` : "Default Server Key"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleTestKey(k); }}
                                                    title="Re-verify key"
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onDeleteKey(k.id); }}
                                                    title="Remove key"
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-background/80 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Add New Key Form */}
                    <form onSubmit={handleVerifyAndSave} className="space-y-3 pt-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                            {keys.length > 0 ? "Connect Another Key" : "Connect an API Key"}
                        </label>

                        <div>
                            <div className="relative">
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={tokenInput}
                                    onChange={(e) => setTokenInput(e.target.value)}
                                    placeholder="apify_api_..."
                                    className="w-full pl-3.5 pr-10 py-2.5 bg-background border border-border/80 rounded-xl text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <input
                                type="text"
                                value={labelInput}
                                onChange={(e) => setLabelInput(e.target.value)}
                                placeholder="Key Label (e.g. Personal Account - Optional)"
                                className="w-full px-3.5 py-2 bg-background border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                            />
                        </div>

                        {verifyError && (
                            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{verifyError}</span>
                            </div>
                        )}

                        {verifySuccess && (
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{verifySuccess}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isVerifying || !tokenInput.trim()}
                            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    Verifying with Apify...
                                </>
                            ) : (
                                <>
                                    <Key className="w-3.5 h-3.5" />
                                    Verify & Save API Key
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
