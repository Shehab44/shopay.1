"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";

type PreviewResult = {
  totalRows: number;
  updatedPrices: number;
  newProducts: number;
  errors: string[];
};

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setPreview(null);
      setSuccess(false);
      setErrorMsg("");
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/admin/import/preview", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تحليل الملف");
      
      setPreview(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/admin/import/commit", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل استيراد الملف");
      
      setSuccess(true);
      setPreview(null);
      setFile(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-shopay-black">مزامنة المنتجات والأسعار</h2>
        <p className="text-shopay-black/60 mt-2">
          قم برفع ملف Excel (CSV) يحتوي على المنتجات (MatCode, Price, etc..) لتحديث الأسعار أو إضافة منتجات جديدة تلقائياً.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-6">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <div>
            <div className="font-bold">تم التحديث بنجاح!</div>
            <div className="text-sm">تم استيراد كافة المنتجات والأسعار وتطبيقها في قاعدة البيانات.</div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <div className="font-bold">خطأ</div>
            <div className="text-sm">{errorMsg}</div>
          </div>
        </div>
      )}

      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light p-8 shadow-sm text-center mb-8">
        <UploadCloud className="w-16 h-16 text-shopay-purple mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold mb-2">اختر ملف CSV</h3>
        
        <input 
          type="file" 
          accept=".csv"
          onChange={handleFileChange}
          className="hidden" 
          id="csv-upload"
        />
        <label 
          htmlFor="csv-upload" 
          className="inline-block px-6 py-2 bg-shopay-gray-light text-shopay-black font-semibold rounded-lg cursor-pointer hover:bg-shopay-gray-light/80 transition-colors"
        >
          تصفح الملفات
        </label>
        
        {file && (
          <div className="mt-4 text-shopay-purple font-mono bg-shopay-purple/5 inline-block px-4 py-2 rounded">
            {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>

      {file && !preview && !success && (
        <div className="text-left flex justify-end">
          <button 
            onClick={handlePreview}
            disabled={loading}
            className="bg-shopay-black text-shopay-white px-8 py-3 rounded-xl font-bold hover:bg-shopay-black/80 transition-colors disabled:opacity-50"
          >
            {loading ? "جاري التحليل..." : "تحليل ومعاينة الملف"}
          </button>
        </div>
      )}

      {preview && (
        <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-shopay-gray-light bg-shopay-gray-light/20">
            <h3 className="text-xl font-bold text-shopay-black">نتائج المعاينة</h3>
            <p className="text-shopay-black/60 text-sm mt-1">يُرجى مراجعة التغييرات قبل التأكيد</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-shopay-gray-light rounded-xl text-center">
              <div className="text-shopay-black/60 text-sm font-semibold mb-1">إجمالي السطور (الأسعار)</div>
              <div className="text-3xl font-bold text-shopay-black">{preview.totalRows}</div>
            </div>
            
            <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-center">
              <div className="text-blue-700/60 text-sm font-semibold mb-1">منتجات جديدة</div>
              <div className="text-3xl font-bold">{preview.newProducts}</div>
            </div>
            
            <div className="p-4 bg-orange-50 text-orange-700 rounded-xl text-center">
              <div className="text-orange-700/60 text-sm font-semibold mb-1">أسعار سيتم تحديثها</div>
              <div className="text-3xl font-bold">{preview.updatedPrices}</div>
            </div>
          </div>
          
          {preview.errors.length > 0 && (
            <div className="p-6 border-t border-shopay-gray-light">
              <h4 className="font-bold text-red-600 mb-2">ملاحظات / أخطاء في الملف:</h4>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                {preview.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="p-6 border-t border-shopay-gray-light flex items-center justify-between bg-shopay-gray-light/20">
            <button 
              onClick={() => setPreview(null)}
              className="text-shopay-black/60 hover:text-shopay-black font-semibold"
            >
              إلغاء
            </button>
            <button 
              onClick={handleCommit}
              disabled={loading}
              className="bg-shopay-gradient text-shopay-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "جاري التحديث..." : "تأكيد وتطبيق التغييرات"}
              {!loading && <ArrowLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
