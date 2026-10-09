import React, { useState } from 'react';
import { Member, Division, Gender, MemberStatus, RoleInOrg } from '../types';
import { normalizeDivision } from '../context/AppContext';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  FileCheck,
  RefreshCw
} from 'lucide-react';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newMembers: Member[], mode: 'append' | 'replace') => void;
  currentTotalMembers: number;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentTotalMembers,
}) => {
  const [parsedMembers, setParsedMembers] = useState<Member[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const downloadTemplateCsv = () => {
    const headers = [
      'NIA',
      'Nama Lengkap',
      'Panggilan',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'No WhatsApp',
      'Email',
      'Divisi',
      'Jabatan',
      'Status',
      'Alamat',
      'Pekerjaan/Pendidikan'
    ];

    const sampleRows = [
      [
        'RM-2024-101',
        'Muhammad Izzat Robbani',
        'Izzat',
        'Ikhwan',
        'Jakarta',
        '2003-04-12',
        '081234567890',
        'izzat@gmail.com',
        'BPH',
        'Ketua Umum',
        'Aktif',
        'Jl. Menteng Asri No. 10',
        'Mahasiswa'
      ],
      [
        'RM-2024-102',
        'Salma Nabila Putri',
        'Salma',
        'Akhwat',
        'Bogor',
        '2004-09-25',
        '081398765432',
        'salma@gmail.com',
        'Media & Humas',
        'Staff Divisi',
        'Aktif',
        'Jl. Sukamaju No. 5',
        'Pelajar / Mahasiswi'
      ],
      [
        'RM-2024-103',
        'Rafi Al-Ghifari',
        'Rafi',
        'Ikhwan',
        'Depok',
        '2002-11-18',
        '085612345678',
        'rafi@gmail.com',
        'Ekraf & Event',
        'Koordinator Divisi',
        'Aktif',
        'Jl. Kramat Raya No. 40',
        'Wirausaha Muda'
      ]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      headers.join(','),
      ...sampleRows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'template-import-anggota-remas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string): Member[] => {
    const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('File CSV kosong atau tidak memiliki baris data.');
    }

    // Detect delimiter (semicolon vs comma)
    const firstLine = lines[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;
    const delimiter = semiCount > commaCount ? ';' : ',';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headerCols = parseLine(lines[0]).map(h => h.toLowerCase().trim());

    // Map column index
    const findIndex = (keywords: string[]) => {
      return headerCols.findIndex(h => keywords.some(k => h.includes(k)));
    };

    const niaIdx = findIndex(['nia', 'nomor induk', 'no induk', 'id anggota']);
    const nameIdx = findIndex(['nama lengkap', 'nama', 'name']);
    const nickIdx = findIndex(['panggilan', 'nama panggilan', 'nickname']);
    const genderIdx = findIndex(['jenis kelamin', 'gender', 'jk', 'sex']);
    const pobIdx = findIndex(['tempat lahir', 'tempat', 'pob']);
    const dobIdx = findIndex(['tanggal lahir', 'tgl lahir', 'dob']);
    const phoneIdx = findIndex(['whatsapp', 'wa', 'telepon', 'no hp', 'phone', 'hp']);
    const emailIdx = findIndex(['email', 'surel']);
    const divIdx = findIndex(['divisi', 'bidang', 'division', 'sie']);
    const roleIdx = findIndex(['jabatan', 'role', 'posisi', 'amanah']);
    const statusIdx = findIndex(['status', 'keaktifan']);
    const addressIdx = findIndex(['alamat', 'address', 'domisili']);
    const jobIdx = findIndex(['pekerjaan', 'pendidikan', 'job', 'profesi']);

    const currentYear = new Date().getFullYear();
    const result: Member[] = [];

    for (let r = 1; r < lines.length; r++) {
      const cols = parseLine(lines[r]);
      if (cols.length === 0 || !cols.some(c => c.trim().length > 0)) continue;

      const rawName = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].trim() : (cols[1] || cols[0] || '').trim();
      if (!rawName) continue;

      const autoNia = niaIdx !== -1 && cols[niaIdx] && cols[niaIdx].trim().length > 0
        ? cols[niaIdx].trim()
        : `RM-${currentYear}-${String(currentTotalMembers + r).padStart(3, '0')}`;

      const rawGender = genderIdx !== -1 && cols[genderIdx] ? cols[genderIdx].toLowerCase().trim() : '';
      const gender: Gender = rawGender.includes('p') || rawGender.includes('akhwat') || rawGender.includes('perempuan') || rawGender.includes('wanita')
        ? 'Akhwat'
        : 'Ikhwan';

      const rawDiv = divIdx !== -1 && cols[divIdx] ? cols[divIdx].trim() : '';
      const division: Division = normalizeDivision(rawDiv);

      const rawRole = roleIdx !== -1 && cols[roleIdx] ? cols[roleIdx].trim() : 'Anggota';
      const role: RoleInOrg = (rawRole as RoleInOrg) || 'Anggota';

      const rawStatus = statusIdx !== -1 && cols[statusIdx] ? cols[statusIdx].toLowerCase().trim() : '';
      let status: MemberStatus = 'Aktif';
      if (rawStatus.includes('non') || rawStatus.includes('pasif')) status = 'Non-aktif';
      else if (rawStatus.includes('alumni')) status = 'Alumni';
      else if (rawStatus.includes('studi') || rawStatus.includes('rantau')) status = 'Merantau/Studi';

      const newMember: Member = {
        id: `mem-${Date.now()}-${r}`,
        nia: autoNia,
        name: rawName,
        nickname: nickIdx !== -1 && cols[nickIdx] ? cols[nickIdx].trim() : rawName.split(' ')[0] || rawName,
        gender,
        pob: pobIdx !== -1 && cols[pobIdx] ? cols[pobIdx].trim() : 'Jakarta',
        dob: dobIdx !== -1 && cols[dobIdx] ? cols[dobIdx].trim() : '2004-01-01',
        phone: phoneIdx !== -1 && cols[phoneIdx] ? cols[phoneIdx].replace(/[^\d+]/g, '') : '',
        email: emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx].trim() : '',
        address: addressIdx !== -1 && cols[addressIdx] ? cols[addressIdx].trim() : 'Kawasan Sekitar Masjid',
        rtRw: '01/01',
        educationJob: jobIdx !== -1 && cols[jobIdx] ? cols[jobIdx].trim() : 'Pelajar / Mahasiswa',
        division,
        role,
        joinedDate: new Date().toISOString().slice(0, 10),
        status,
        bloodType: '-',
        skillsInterest: ['Kajian', 'Syiar Islam'],
        photoUrl: gender === 'Akhwat' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        emergencyContact: {
          name: 'Orang Tua / Wali',
          relation: 'Orang Tua',
          phone: '',
        }
      };

      result.push(newMember);
    }

    return result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const members = parseCsvText(text);
        if (members.length === 0) {
          setErrorMsg('Tidak ditemukan data anggota yang valid pada file CSV.');
          setParsedMembers([]);
        } else {
          setParsedMembers(members);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal membaca format CSV.');
        setParsedMembers([]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Terjadi kesalahan saat membaca file.');
      setIsProcessing(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleExecuteImport = () => {
    if (parsedMembers.length === 0) return;
    onImport(parsedMembers, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Impor Data Anggota (CSV)</h3>
              <p className="text-[11px] text-slate-300">
                Unggah spreadsheet massal untuk memperbarui database remaja masjid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Guide Banner & Download Template */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>Format Divisi yang Didukung:</span>
              </p>
              <p className="text-[11px] text-emerald-800">
                Sistem akan otomatis menyesuaikan divisi ke: <strong>BPH</strong>, <strong>Media & Humas</strong>, atau <strong>Ekraf & Event</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadTemplateCsv}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs text-[11px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Contoh CSV</span>
            </button>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">
              Pilih File CSV (.csv):
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-6 text-center transition-colors bg-slate-50/60 hover:bg-emerald-50/30">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold cursor-pointer shadow-xs transition-colors text-xs">
                <span>Pilih File Spreadsheet</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-2">
                {fileName ? (
                  <span className="font-semibold text-emerald-800">File terpilih: {fileName}</span>
                ) : (
                  'Mendukung file .csv dengan pemisah koma (,) atau titik-koma (;)'
                )}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Import Mode Options */}
          {parsedMembers.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Metode Penggabungan Database:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    importMode === 'append'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-xs">Tambahkan ke Data Ada (Append)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menambahkan anggota baru tanpa menghapus data anggota yang sudah tersimpan.
                      </p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    importMode === 'replace'
                      ? 'border-rose-600 bg-rose-50 text-rose-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <p className="font-bold text-xs">Gantikan Seluruh Data (Replace)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menimpa dan mengganti seluruh daftar anggota lama dengan data dari CSV ini.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pratinjau Data Terbaca ({parsedMembers.length} Anggota)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Menampilkan hingga 5 baris pertama</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2 px-3">NIA</th>
                        <th className="py-2 px-3">Nama Lengkap</th>
                        <th className="py-2 px-3">Gender</th>
                        <th className="py-2 px-3">Divisi</th>
                        <th className="py-2 px-3">Jabatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedMembers.slice(0, 5).map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-1.5 px-3 font-mono text-slate-500">{m.nia}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{m.name}</td>
                          <td className="py-1.5 px-3 text-slate-600">{m.gender}</td>
                          <td className="py-1.5 px-3">
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                              {m.division}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">{m.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            {parsedMembers.length > 0 ? `${parsedMembers.length} anggota siap diproses` : 'Pilih file CSV untuk memulai'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={parsedMembers.length === 0 || isProcessing}
              onClick={handleExecuteImport}
              className={`px-5 py-2 rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
                parsedMembers.length > 0 && !isProcessing
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Impor {parsedMembers.length > 0 ? `${parsedMembers.length} Anggota` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
