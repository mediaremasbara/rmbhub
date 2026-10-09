import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MosqueProfile } from '../types';
import { X, Save, RotateCcw, Download, Upload, Shield, Image, Stamp, Trash2, CheckCircle2 } from 'lucide-react';
import defaultEmblem from '../assets/images/mosque_youth_emblem_1791556850715.jpg';

interface MosqueSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MosqueSettingsModal: React.FC<MosqueSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    profile, 
    updateMosqueProfile, 
    resetToDefaultData, 
    exportDatabaseJson, 
    importDatabaseJson 
  } = useApp();

  const [formData, setFormData] = useState<MosqueProfile>({ ...profile });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, emblemUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, stampUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMosqueProfile(formData);
    onClose();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ok = importDatabaseJson(content);
        if (ok) {
          setImportStatus('Database berhasil dipulihkan!');
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Gagal memulihkan file. Format JSON tidak sesuai.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Pengaturan Lembaga & Format KTA</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Organisasi Remaja Masjid</label>
            <input
              type="text"
              required
              value={formData.orgName}
              onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Masjid Induk</label>
            <input
              type="text"
              required
              value={formData.mosqueName}
              onChange={(e) => setFormData({ ...formData, mosqueName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kota / Domisili</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Kontak Sekretariat</label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap Masjid</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Ketua Umum (Penandatangan KTA)</label>
              <input
                type="text"
                value={formData.leaderName}
                onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Masa Berlaku KTA</label>
              <input
                type="text"
                value={formData.cardValidUntil}
                onChange={(e) => setFormData({ ...formData, cardValidUntil: e.target.value })}
                placeholder="Contoh: 31 Desember 2027"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motto / Visi Organisasi</label>
            <textarea
              rows={2}
              value={formData.motto}
              onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          {/* Logo & Cap/Stempel Resmi Upload Section */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                <Image className="w-4 h-4 text-emerald-700" />
                <span>Identitas Grafis Resmi (Logo & Cap / Stempel Remas)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kustomisasi lambang dan cap legalitas yang langsung tercetak di kartu anggota (KTA).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Logo / Emblem */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Logo Remaja Masjid</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded">Muka Depan KTA</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-600/40 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    {formData.emblemUrl ? (
                      <img
                        src={formData.emblemUrl}
                        alt="Preview Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Logo Baru</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.emblemUrl !== defaultEmblem && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, emblemUrl: defaultEmblem }))}
                        className="block text-[10px] text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        Kembalikan logo default
                      </button>
                    )}
                    <p className="text-[10px] text-slate-400">PNG transparan / JPG disarankan</p>
                  </div>
                </div>
              </div>

              {/* Cap / Stempel Resmi */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Cap / Stempel Resmi</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-1.5 py-0.5 rounded">Muka Belakang KTA</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-500/50 flex items-center justify-center shrink-0 shadow-xs overflow-hidden relative">
                    {formData.stampUrl ? (
                      <img
                        src={formData.stampUrl}
                        alt="Preview Stempel"
                        className="w-full h-full object-contain rotate-[-8deg] p-0.5"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full border border-dashed border-emerald-500 bg-emerald-50/60 flex flex-col items-center justify-center text-center rotate-[-8deg]">
                        <span className="text-[7px] font-bold text-emerald-800 leading-tight">CAP<br/>RESMI</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] cursor-pointer transition-colors shadow-xs">
                      <Stamp className="w-3.5 h-3.5" />
                      <span>{formData.stampUrl ? 'Ganti Cap / Stempel' : 'Unggah Cap / Stempel'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStampUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.stampUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, stampUrl: '' }))}
                        className="flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus stempel kustom</span>
                      </button>
                    )}
                    <p className="text-[10px] text-slate-400">Format PNG transparan dianjurkan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Restore Tools */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Manajemen Cadangan & Pemulihan Database</h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportDatabaseJson}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Unduh Cadangan (Backup JSON)</span>
              </button>

              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-700" />
                <span>Pulihkan Database (Import JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={resetToDefaultData}
                className="px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Awal</span>
              </button>
            </div>

            {importStatus && (
              <p className="mt-2 text-emerald-700 font-semibold">{importStatus}</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
