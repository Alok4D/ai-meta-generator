"use client";

import React, { useState } from "react";
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, Trash2, ShieldCheck, RefreshCw, Eye, EyeOff, Plus, Lock, Unlock } from "lucide-react";
import { ApifyKeyRecord } from "./types";

interface DraftKeyRow {
    id: string;
    token: string;
    label: string;
    showToken: boolean;
}

const createDraftRow = (): DraftKeyRow => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    token: "",
    label: "",
    showToken: false
});

interface ApiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    keys: ApifyKeyRecord[];
    selectedKeyId: string | null;
    onSelectKey: (id: string) => void;
    onAddKey: (key: ApifyKeyRecord) => void;
    onAddKeys?: (keys: ApifyKeyRecord[]) => void;
    onDeleteKey: (id: string) => void;
    onUpdateKey: (key: ApifyKeyRecord) => void;
    failedKeysCount?: number;
    onResetFailedKeys?: () => void;
    isSystemUnlocked?: boolean;
    onUnlockSystem?: (accessToken: string) => void;
    onLockSystem?: () => void;
}

export default function ApiSettingsModal({
    isOpen,
    onClose,
    keys,
    selectedKeyId,
    onSelectKey,
    onAddKey,
    onAddKeys,
    onDeleteKey,
    onUpdateKey,
    failedKeysCount = 0,
    onResetFailedKeys,
    isSystemUnlocked = false,
    onUnlockSystem,
    onLockSystem
}: ApiSettingsModalProps) {
    const [draftKeys, setDraftKeys] = useState<DraftKeyRow[]>([createDraftRow()]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

    const [magicWordInput, setMagicWordInput] = useState("");
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [unlockError, setUnlockError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAddDraftRow = () => {
        setDraftKeys((prev) => [...prev, createDraftRow()]);
    };

    const handleRemoveDraftRow = (rowId: string) => {
        setDraftKeys((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== rowId) : prev));
    };

    const handleUpdateDraftRow = (rowId: string, patch: Partial<DraftKeyRow>) => {
        setDraftKeys((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
    };

    const handleVerifyAndSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const nonEmptyRows = draftKeys
            .map((r) => ({ ...r, token: r.token.trim(), label: r.label.trim() }))
            .filter((r) => r.token.length > 0);

        if (nonEmptyRows.length === 0) {
            setVerifyError("Please enter at least one Apify API key.");
            return;
        }

        setIsVerifying(true);
        setVerifyError(null);
        setVerifySuccess(null);

        try {
            const results = await Promise.all(
                nonEmptyRows.map(async (row, idx) => {
                    const res = await fetch("/api/adobe-tracker/verify-key", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: row.token })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.valid) {
                        return { ok: false as const, index: idx + 1, error: data.error || "Invalid Apify token" };
                    }
                    const record: ApifyKeyRecord = {
                        id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
                        token: row.token,
                        label: row.label || data.username || `Apify Key ${idx + 1}`,
                        username: data.username,
                        plan: data.plan,
                        monthlyCredits: data.monthlyCredits,
                        health: 'active',
                        verifiedAt: new Date().toISOString()
                    };
                    return { ok: true as const, record, username: data.username, plan: data.plan };
                })
            );

            const validRecords = results.filter((r): r is Extract<typeof r, { ok: true }> => r.ok);
            const failedRows = results.filter((r): r is Extract<typeof r, { ok: false }> => !r.ok);

            if (validRecords.length > 0) {
                const recordsToAdd = validRecords.map((r) => r.record);
                if (onAddKeys) {
                    onAddKeys(recordsToAdd);
                } else {
                    recordsToAdd.forEach((rec) => onAddKey(rec));
                }
            }

            if (failedRows.length > 0) {
                setVerifyError(
                    failedRows.map((f) => `Key #${f.index}: ${f.error}`).join(" | ")
                );
            }

            if (validRecords.length > 0 && failedRows.length === 0) {
                const firstValid = validRecords[0];
                setVerifySuccess(
                    validRecords.length === 1 && firstValid
                        ? `Connected as @${firstValid.username} (${firstValid.plan} tier)`
                        : `${validRecords.length} Apify API keys verified and saved!`
                );
                setDraftKeys([createDraftRow()]);
            } else if (validRecords.length > 0) {
                setVerifySuccess(`${validRecords.length} key(s) saved. Fix or remove the failed key(s) below.`);
            }
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

    const handleUnlockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = magicWordInput.trim();
        if (!trimmed) {
            setUnlockError("Please enter the magic word.");
            return;
        }
        setIsUnlocking(true);
        setUnlockError(null);
        try {
            const res = await fetch("/api/adobe-tracker/unlock-system", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ magicWord: trimmed })
            });
            const data = await res.json();
            if (!res.ok || !data.unlocked || !data.accessToken) {
                throw new Error(data.error || "Invalid magic word.");
            }
            onUnlockSystem?.(data.accessToken);
            setMagicWordInput("");
        } catch (err: any) {
            setUnlockError(err.message || "Failed to unlock system keys.");
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full rounded-[2px] max-w-xl bg-card border border-border/80 shadow-xl p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-none bg-background flex items-center justify-center">
                            <img
                                src="https://apify.com/img/apify-logo/apify-symbol-200x200.svg"
                                alt="Apify"
                                className="w-9 h-9 object-contain"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-base">Apify API Settings</h3>
                            <p className="text-xs text-muted-foreground">Manage your Apify connection for Adobe Stock tracking</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-none flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Info Note */}
                    <div className="bg-muted/30 border border-border/80 rounded-none p-3.5 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#1473E6] shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground">Free &amp; Private: </span>
                            Keys are stored securely in your browser and used to run the Adobe Stock tracker directly. Add multiple keys for automatic fallback. Get your free personal token from{" "}
                            <a
                                href="https://console.apify.com/settings/integrations"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#1473E6] font-medium hover:underline inline-flex items-center gap-0.5"
                            >
                                Apify Integrations <ExternalLink className="w-3 h-3" />
                            </a>.
                        </div>
                    </div>

                    {/* Magic Word System Access */}
                    {onUnlockSystem && (
                        <div className="border border-border/80 bg-muted/20 rounded-none p-3.5">
                            {isSystemUnlocked ? (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                                        <Unlock className="w-4 h-4 shrink-0" />
                                        <span className="font-medium">System API keys unlocked via magic word</span>
                                    </div>
                                    {onLockSystem && (
                                        <button
                                            type="button"
                                            onClick={onLockSystem}
                                            className="px-2.5 py-1 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground border border-border/80 rounded-none transition-colors cursor-pointer"
                                        >
                                            Lock
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleUnlockSubmit} className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>System API Access (Magic Word)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="password"
                                            value={magicWordInput}
                                            onChange={(e) => setMagicWordInput(e.target.value)}
                                            placeholder="Enter magic word to unlock system keys..."
                                            className="flex-1 px-3 py-2 bg-background border border-border/80 rounded-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#1473E6] focus:border-[#1473E6]"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isUnlocking}
                                            className="px-3.5 py-2 bg-foreground hover:bg-foreground/90 text-background text-xs font-medium rounded-none transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                                        >
                                            {isUnlocking ? "Checking..." : "Unlock"}
                                        </button>
                                    </div>
                                    {unlockError && (
                                        <p className="text-[11px] text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{unlockError}</span>
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>
                    )}

                    {/* Failed Keys Reset Banner */}
                    {failedKeysCount > 0 && onResetFailedKeys && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-none p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>
                                    {failedKeysCount} fallback {failedKeysCount === 1 ? "key is" : "keys are"} marked as failed until the monthly reset.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={onResetFailedKeys}
                                className="px-2.5 py-1 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 rounded-none transition-colors shrink-0 cursor-pointer"
                            >
                                Reset
                            </button>
                        </div>
                    )}

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
                                            className={`p-3 rounded-none border transition-all cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                    ? "bg-[#1473E6]/10 border-[#1473E6] text-foreground shadow-xs"
                                                    : "bg-muted/30 border-border/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
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
                                                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-none text-muted-foreground border border-border/60">
                                                                @{k.username}
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <span className="text-[10px] font-semibold bg-[#1473E6] text-white px-1.5 py-0.5 rounded-none">
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
                                                    className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors border border-transparent hover:border-border/80"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); onDeleteKey(k.id); }}
                                                    title="Remove key"
                                                    className="p-1.5 rounded-none text-muted-foreground hover:text-rose-500 hover:bg-background/80 transition-colors border border-transparent hover:border-border/80"
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

                    {/* Add New Key(s) Form */}
                    <form onSubmit={handleVerifyAndSave} className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {keys.length > 0 ? "Connect Another Key" : "Connect an API Key"}
                            </label>
                            <button
                                type="button"
                                onClick={handleAddDraftRow}
                                title="Add another key input"
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#1473E6] hover:bg-[#1473E6]/10 border border-[#1473E6]/30 rounded-none transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Key</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {draftKeys.map((row, idx) => (
                                <div key={row.id} className="space-y-2 p-2.5 bg-muted/20 border border-border/60 rounded-none">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type={row.showToken ? "text" : "password"}
                                                value={row.token}
                                                onChange={(e) => handleUpdateDraftRow(row.id, { token: e.target.value })}
                                                placeholder={`apify_api_... (Key ${idx + 1})`}
                                                className="w-full pl-3.5 pr-10 py-2.5 bg-background border border-border/80 rounded-none text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#1473E6] focus:border-[#1473E6] transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateDraftRow(row.id, { showToken: !row.showToken })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                                {row.showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {draftKeys.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDraftRow(row.id)}
                                                title="Remove this key input"
                                                className="p-2.5 bg-background border border-border/80 text-muted-foreground hover:text-rose-500 hover:border-rose-500/40 rounded-none transition-colors cursor-pointer shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={row.label}
                                        onChange={(e) => handleUpdateDraftRow(row.id, { label: e.target.value })}
                                        placeholder="Key Label (e.g. Personal Account - Optional)"
                                        className="w-full px-3.5 py-2 bg-background border border-border/80 rounded-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#1473E6] focus:border-[#1473E6] transition-all"
                                    />
                                </div>
                            ))}
                        </div>

                        {verifyError && (
                            <div className="p-2.5 rounded-none bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{verifyError}</span>
                            </div>
                        )}

                        {verifySuccess && (
                            <div className="p-2.5 rounded-none bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{verifySuccess}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full py-2.5 px-4 bg-[#1473E6] hover:bg-[#0d66d0] text-white font-medium text-sm rounded-none transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                        >
                            {isVerifying ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Verifying with Apify...</span>
                                </>
                            ) : (
                                <>
                                    <Key className="w-4 h-4" />
                                    <span>
                                        {draftKeys.length > 1
                                            ? `Verify & Save ${draftKeys.length} API Keys`
                                            : "Verify & Save API Key"}
                                    </span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
