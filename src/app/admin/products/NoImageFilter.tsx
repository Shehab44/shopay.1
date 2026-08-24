"use client";

export default function NoImageFilter({ q, noImage }: { q: string, noImage: boolean }) {
  return (
    <form method="GET" action="/admin/products">
      {q && <input type="hidden" name="q" value={q} />}
      <label className="flex items-center gap-2 cursor-pointer text-sm text-shopay-black/80 font-medium">
        <input 
          type="checkbox" 
          name="noImage" 
          value="true" 
          defaultChecked={noImage}
          onChange={(e) => e.target.form?.submit()}
          className="rounded text-shopay-purple focus:ring-shopay-purple"
        />
        عرض المنتجات بدون صورة فقط
      </label>
    </form>
  );
}
