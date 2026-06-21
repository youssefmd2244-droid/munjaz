/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SecretKey } from "../types";
import { Shield, Lock, Unlock, Key, RefreshCw, CheckCircle2 } from "lucide-react";

interface SecretsVaultProps {
  secrets: SecretKey[];
  onUpdateSecrets: (secrets: SecretKey[]) => void;
  onAddLog: (message: string, level: "info" | "success" | "warn" | "error", nodeName: string) => void;
  t: any;
  lang: string;
}

export default function SecretsVault({ secrets, onUpdateSecrets, onAddLog, t, lang }: SecretsVaultProps) {
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({});
  const [isRotating, setIsRotating] = useState(false);

  const toggleReveal = (id: string, name: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
    const verb = showValues[id]
      ? (lang === "ar" ? "قناع" : "Masked")
      : (lang === "ar" ? "كشف" : "Revealed");
    
    onAddLog(
      lang === "ar"
        ? `تم ${verb} مؤشر الاعتماد لـ ${name}`
        : `${verb} credential indicator for ${name}`,
      "info",
      "SecretKeeper"
    );
  };

  const handleRotateKeys = () => {
    setIsRotating(true);
    onAddLog(
      lang === "ar"
        ? "بدء دورة تدوير المفاتيح الديناميكية على مصفوفات تشفير فيرنت المتماثلة..."
        : "Initiated dynamic key rotation cycle on symmetric Fernet matrices...",
      "info",
      "SecretKeeper"
    );

    setTimeout(() => {
      const updated = secrets.map((s) => {
        if (s.name === "ICON_MASTER_KEY") {
          return {
            ...s,
            value: `fernet_rotated_${Math.random().toString(36).substring(2, 12)}_2026`,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });
      onUpdateSecrets(updated);
      setIsRotating(false);
      onAddLog(
        lang === "ar"
          ? "تم الانتهاء من تدوير المفاتيح. تمت مزامنة تواقيع نظام الملفات وتطهير نواقل الذاكرة القديمة."
          : "Key rotation finalized. Virtual filesystem signatures synchronized, old memory vectors cleared.",
        "success",
        "SecretKeeper"
      );
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-gray-805">
        <div>
          <h2 className="text-lg font-sans font-medium text-white tracking-tight flex items-center gap-2">
            <Shield className="text-emerald-400 w-5 h-5 animate-pulse" /> {t.securityTitle}
          </h2>
          <p className="text-xs text-gray-500 font-mono font-normal">{t.securitySubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secrets Configuration Table */}
        <div className="lg:col-span-2 bg-[#111318]/90 border border-gray-800 rounded-lg p-5 space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{t.activeCredentials}</h3>
            <span className="text-[10px] font-mono text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
              {t.encryptionStandard}
            </span>
          </div>

          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            {t.secretsDescription}
          </p>

          <div className="space-y-3.5 pt-2">
            {secrets.map((sec) => (
              <div
                key={sec.id}
                className="p-3.5 rounded bg-[#0c0d12]/70 border border-gray-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
              >
                <div className="space-y-1">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide font-semibold">
                    <Key className="w-3.5 h-3.5 text-emerald-400" /> {sec.name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 block">
                    {lang === "ar" && sec.category === "System Secret Engine" ? "محرك نظام سري" : sec.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="font-mono text-xs text-gray-400 bg-gray-950 px-3 py-1.5 rounded border border-gray-900 truncate max-w-[200px] select-all">
                    {showValues[sec.id]
                      ? sec.value
                      : sec.value === "CONFIGURED_LIVE"
                      ? (lang === "ar" ? "نشط بالذكاء الاصطناعي (••••••••••••••)" : "LIVE_AI_ACTIVE (••••••••••••••)")
                      : "••••••••••••••••••••••••••••••••"}
                  </div>

                  <button
                    onClick={() => toggleReveal(sec.id, sec.name)}
                    className="px-2.5 py-1.5 rounded text-[10px] font-mono hover:text-white border border-gray-800 hover:border-gray-700 bg-gray-900/40 text-gray-400 transition cursor-pointer"
                  >
                    {showValues[sec.id] ? t.hide : t.reveal}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-300 rounded font-sans leading-relaxed">
              <strong>{t.tipTitle}</strong> {t.tipDesc}
            </div>
          </div>
        </div>

        {/* Cryptographic Node Statistics */}
        <div className="bg-[#111318]/90 border border-gray-800 rounded-lg p-5 flex flex-col justify-between text-left space-y-5">
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-800 pb-2.5">
              <Shield className="w-4 h-4 text-emerald-400" /> {t.securityIndex}
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="border border-gray-850 p-3 rounded bg-gray-950 space-y-2">
                <span className="text-[9px] text-gray-500 block uppercase font-mono">{t.dynamicFingerprint}</span>
                <span className="text-emerald-400 tracking-wider text-xs block truncate select-all">
                  a1b9c8e7f6d5c4b3a201f8e7d6c5b4a3_fernet_aes
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-850 text-[11px]">
                <span className="text-gray-500">{t.protectionStrategy}</span>
                <span className="text-white">{t.aesSymmetric}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-850 text-[11px]">
                <span className="text-gray-500">{t.rating}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  {t.secureRating} <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-850 text-[11px]">
                <span className="text-gray-500">{t.localCacheKeys}</span>
                <span className="text-white">{t.encryptedFilesystem}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-850 text-[11px]">
                <span className="text-gray-500">{t.playwrightIncognito}</span>
                <span className="text-emerald-400 font-semibold uppercase">{t.active}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRotateKeys}
            disabled={isRotating}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-black font-semibold font-mono rounded bg-emerald-400 hover:bg-emerald-350 transition cursor-pointer"
          >
            {isRotating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t.rotatingKeyBtn}
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5" /> {t.rotateKeyBtn}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
