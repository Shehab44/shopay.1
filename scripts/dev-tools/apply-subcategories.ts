/**
 * سكريبت التسكين الفعلي للتفرعات (Apply Subcategories)
 * 
 * الميزات والضوابط:
 * 1. تطبيق قاموس التفرعات المنقح للأقسام الـ 14 (أعلى 8 إلى 12 فئة نقية لكل قسم، مع تثبيت فئة "فرد" للألعاب).
 * 2. الاعتماد الحصري على المطابقة الدقيقة للكلمة الكاملة المستقلة (Token-Based Whole-Word Match).
 * 3. منع استخدام .includes() المجردة تماماً لتفادي فخاخ التطابق الجزئي (مثل منع مطابقة "ورد" داخل "مستورد").
 * 4. حصر التحديث في حقل subCategoryLabel فقط مع بقاء categoryId وكافة الحقول الأخرى دون أي مساس.
 * 5. دعم خيار التشغيل الجاف عبر الراية --dry-run لعرض الإحصائيات ونسب التغطية.
 * 6. استخدام دفعات مجزأة (Batches) داخل معاملات prisma.$transaction بمهلة موسعة: { maxWait: 10000, timeout: 60000 }.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SubCategoryDef {
  label: string;
  matchTokens: string[];
}

export const SUBCATEGORIES_BY_PREFIX: Record<string, SubCategoryDef[]> = {
  // 101: أجهزة كهربائية وسخانات
  '101': [
    { label: 'بطارية', matchTokens: ['بطاريه', 'بطاريات'] },
    { label: 'دجنتير', matchTokens: ['دجنتير', 'ديجنتير', 'دجانتر'] },
    { label: 'لمبة', matchTokens: ['لمبه', 'لمبات'] },
    { label: 'تابلو', matchTokens: ['تابلو', 'تابلوه'] },
    { label: 'أليف', matchTokens: ['اليف'] },
    { label: 'كبل', matchTokens: ['كبل', 'كابل', 'كابلات'] },
    { label: 'ليد', matchTokens: ['ليد'] },
    { label: 'سكين', matchTokens: ['سكين'] },
    { label: 'شاحن', matchTokens: ['شاحن', 'شواحن'] },
    { label: 'سخان', matchTokens: ['سخان', 'سخانات'] },
    { label: 'إنفرتر', matchTokens: ['انفرتر', 'انفيرتر'] },
  ],

  // 102: مستلزمات كهربائية
  '102': [
    { label: 'لمبة', matchTokens: ['لمبه', 'لمبات'] },
    { label: 'ليد', matchTokens: ['ليد'] },
    { label: 'سوكة', matchTokens: ['سوكه', 'سوكات'] },
    { label: 'وصلة', matchTokens: ['وصله', 'وصلات'] },
    { label: 'بطارية', matchTokens: ['بطاريه', 'بطاريات'] },
    { label: 'فيش', matchTokens: ['فيش', 'فيشه'] },
    { label: 'بيل', matchTokens: ['بيل'] },
    { label: 'حبل', matchTokens: ['حبل'] },
    { label: 'مروحة', matchTokens: ['مروحه', 'مراوح'] },
    { label: 'مكنة', matchTokens: ['مكنه', 'ماكينه'] },
    { label: 'فانوس', matchTokens: ['فانوس', 'فوانيس'] },
    { label: 'ميزان', matchTokens: ['ميزان'] },
  ],

  // 103: أدوات منزلية ومطبخ
  '103': [
    { label: 'صحن', matchTokens: ['صحن', 'صحون'] },
    { label: 'ماغ', matchTokens: ['ماغ', 'مج'] },
    { label: 'زبدية', matchTokens: ['زبديه', 'زبادي'] },
    { label: 'صينية', matchTokens: ['صينيه', 'صواني'] },
    { label: 'ورد', matchTokens: ['ورد', 'ورود'] },
    { label: 'كاسة', matchTokens: ['كاسه', 'كاسات'] },
    { label: 'ستاند', matchTokens: ['ستاند', 'استاند'] },
    { label: 'شاي', matchTokens: ['شاي'] },
    { label: 'جاط', matchTokens: ['جاط', 'جاطات'] },
    { label: 'إبريق', matchTokens: ['ابريق', 'اباريق'] },
    { label: 'طنجرة', matchTokens: ['طنجره', 'طناجر'] },
    { label: 'غاز', matchTokens: ['غاز'] },
  ],

  // 104: مستلزمات منزلية ونظافة صحية
  '104': [
    { label: 'فونتور', matchTokens: ['فونتور'] },
    { label: 'مفك', matchTokens: ['مفك', 'مفكات'] },
    { label: 'نبريش', matchTokens: ['نبريش'] },
    { label: 'غاز', matchTokens: ['غاز'] },
    { label: 'سبراي', matchTokens: ['سبراي'] },
    { label: 'دهان', matchTokens: ['دهان'] },
    { label: 'شطاف', matchTokens: ['شطاف', 'شطافه'] },
    { label: 'فرشاة', matchTokens: ['فرشاه', 'فرشايه', 'فراشي'] },
    { label: 'حنفية', matchTokens: ['حنفيه', 'حنفيات'] },
    { label: 'بنسة', matchTokens: ['بنسه'] },
    { label: 'دوش', matchTokens: ['دوش'] },
    { label: 'منشار', matchTokens: ['منشار'] },
  ],

  // 105: أزياء وإكسسوارات رأس
  '105': [
    { label: 'طاقية', matchTokens: ['طاقيه', 'طواقي'] },
    { label: 'كلسات', matchTokens: ['كلسات', 'كلسه'] },
    { label: 'كف', matchTokens: ['كف', 'كفوف'] },
    { label: 'شمسية', matchTokens: ['شمسيه'] },
    { label: 'حمالة', matchTokens: ['حماله'] },
    { label: 'شتوي', matchTokens: ['شتوي'] },
    { label: 'مطر', matchTokens: ['مطر'] },
    { label: 'ستيانة', matchTokens: ['ستيانه'] },
    { label: 'ستراس', matchTokens: ['ستراس'] },
    { label: 'مخمل', matchTokens: ['مخمل'] },
  ],

  // 106: ألعاب أطفال (تثبيت فئة "فرد" صراحة)
  '106': [
    { label: 'فرد', matchTokens: ['فرد'] },
    { label: 'بارودة', matchTokens: ['باروده', 'بارود'] },
    { label: 'ألعاب', matchTokens: ['العاب', 'لعبه'] },
    { label: 'سباحة', matchTokens: ['سباحه'] },
    { label: 'أوربز', matchTokens: ['اوربز'] },
    { label: 'سيارة', matchTokens: ['سياره', 'سيارات'] },
    { label: 'نفخ', matchTokens: ['نفخ'] },
    { label: 'باربي', matchTokens: ['باربي'] },
    { label: 'بالون', matchTokens: ['بالون', 'بالونات'] },
    { label: 'بحر', matchTokens: ['بحر'] },
    { label: 'صابون', matchTokens: ['صابون'] },
  ],

  // 107: مستحضرات تجميل وعناية
  '107': [
    { label: 'كريم', matchTokens: ['كريم', 'كريمات'] },
    { label: 'مكنة', matchTokens: ['مكنه', 'ماكينه'] },
    { label: 'شعر', matchTokens: ['شعر'] },
    { label: 'حلاقة', matchTokens: ['حلاقه'] },
    { label: 'قلم', matchTokens: ['قلم', 'اقلام'] },
    { label: 'مزيل', matchTokens: ['مزيل'] },
    { label: 'مكياج', matchTokens: ['مكياج'] },
    { label: 'حمرة', matchTokens: ['حمره'] },
    { label: 'سبراي', matchTokens: ['سبراي'] },
    { label: 'زيت', matchTokens: ['زيت', 'زيوت'] },
    { label: 'شامبو', matchTokens: ['شامبو'] },
    { label: 'لوشن', matchTokens: ['لوشن'] },
  ],

  // 108: إكسسوارات شعر
  '108': [
    { label: 'طوق', matchTokens: ['طوق', 'اطواق'] },
    { label: 'مرسم', matchTokens: ['مرسم'] },
    { label: 'مطاط', matchTokens: ['مطاط'] },
    { label: 'جزدان', matchTokens: ['جزدان'] },
    { label: 'مسبحة', matchTokens: ['مسبحه', 'مسابح'] },
    { label: 'تعاليق', matchTokens: ['تعاليق', 'تعليقه'] },
    { label: 'مونديال', matchTokens: ['مونديال'] },
    { label: 'حلق', matchTokens: ['حلق'] },
    { label: 'مزهرية', matchTokens: ['مزهريه', 'مزهريات'] },
    { label: 'صمدية', matchTokens: ['صمديه', 'صمديات'] },
    { label: 'كليبس', matchTokens: ['كليبس', 'كليبسات'] },
    { label: 'شعر', matchTokens: ['شعر'] },
  ],

  // 109: مستلزمات أطفال
  '109': [
    { label: 'قلم', matchTokens: ['قلم', 'اقلام', 'قلمان'] },
    { label: 'مطرة', matchTokens: ['مطره', 'مطرات'] },
    { label: 'دفتر', matchTokens: ['دفتر', 'دفاتر'] },
    { label: 'بوكس', matchTokens: ['بوكس', 'بوكسات'] },
    { label: 'مقلمة', matchTokens: ['مقلمه', 'مقلمات'] },
    { label: 'لنش', matchTokens: ['لنش'] },
    { label: 'تلوين', matchTokens: ['تلوين'] },
    { label: 'محاية', matchTokens: ['محايه', 'محايات'] },
    { label: 'ورقة', matchTokens: ['ورقه', 'اوراق'] },
    { label: 'حبر', matchTokens: ['حبر'] },
    { label: 'شنطة', matchTokens: ['شنطه', 'شناتي', 'شنط'] },
  ],

  // 110: أحذية
  '110': [
    { label: 'شحاط', matchTokens: ['شحاط', 'شحاطات', 'شحاطه'] },
    { label: 'إصبع', matchTokens: ['اصبع'] },
    { label: 'بوتيك', matchTokens: ['بوتيك'] },
    { label: 'إيفا', matchTokens: ['ايفا'] },
    { label: 'بوبي', matchTokens: ['بوبي'] },
    { label: 'عيون', matchTokens: ['عيون'] },
    { label: 'هيلينا', matchTokens: ['هيلينا'] },
    { label: 'ليفر', matchTokens: ['ليفر'] },
    { label: 'نايس', matchTokens: ['نايس'] },
    { label: 'فنيسيا', matchTokens: ['فنيسيا'] },
    { label: 'هيرو', matchTokens: ['هيرو'] },
  ],

  // 111: طاقة وأجهزة إنفرتر
  '111': [
    { label: 'إنفرتر', matchTokens: ['انفرتر', 'انفيرتر'] },
    { label: 'كاش', matchTokens: ['كاش'] },
    { label: 'كبل', matchTokens: ['كبل', 'كابل'] },
    { label: 'مخرم', matchTokens: ['مخرم'] },
    { label: 'مروحة', matchTokens: ['مروحه', 'مراوح'] },
    { label: 'بطارية', matchTokens: ['بطاريه', 'بطاريات'] },
    { label: 'كوس', matchTokens: ['كوس'] },
    { label: 'دراكون', matchTokens: ['دراكون'] },
    { label: 'لوح', matchTokens: ['لوح'] },
    { label: 'برغي', matchTokens: ['برغي', 'براغي'] },
  ],

  // 112: عدة وأدوات ورشة
  '112': [
    { label: 'كف', matchTokens: ['كف', 'كفوف'] },
    { label: 'عمال', matchTokens: ['عمال'] },
    { label: 'غاز', matchTokens: ['غاز'] },
    { label: 'حبسة', matchTokens: ['حبسه'] },
    { label: 'مفتاح', matchTokens: ['مفتاح', 'مفاتيح'] },
    { label: 'مفك', matchTokens: ['مفك', 'مفكات'] },
    { label: 'حنفية', matchTokens: ['حنفيه', 'حنفيات'] },
    { label: 'سكر', matchTokens: ['سكر'] },
    { label: 'خلاط', matchTokens: ['خلاط'] },
    { label: 'فصالية', matchTokens: ['فصاليه'] },
    { label: 'قسطل', matchTokens: ['قسطل'] },
    { label: 'سخان', matchTokens: ['سخان'] },
  ],

  // 113: أدوات تنظيف
  '113': [
    { label: 'مرطبان', matchTokens: ['مرطبان', 'مرطبانات'] },
    { label: 'غالون', matchTokens: ['غالون', 'غالونات'] },
    { label: 'مازوت', matchTokens: ['مازوت'] },
    { label: 'ريشة', matchTokens: ['ريشه'] },
    { label: 'غبرة', matchTokens: ['غبره'] },
    { label: 'دبة', matchTokens: ['دبيه', 'دبه'] },
    { label: 'زيتون', matchTokens: ['زيتون'] },
    { label: 'عصا', matchTokens: ['عصا', 'عصاي'] },
    { label: 'مساحة', matchTokens: ['مساحه', 'مساحات'] },
    { label: 'قنينة', matchTokens: ['قنينه', 'قناني'] },
    { label: 'ليف', matchTokens: ['ليف', 'ليفه'] },
    { label: 'مرشة', matchTokens: ['مرشه'] },
  ],

  // 114: جلديات وأدوات رياضية
  '114': [
    { label: 'فتبول', matchTokens: ['فتبول'] },
    { label: 'ضروب', matchTokens: ['ضروب'] },
    { label: 'أوربز', matchTokens: ['اوربز'] },
    { label: 'طابة', matchTokens: ['طابه', 'طابات'] },
    { label: 'شبك', matchTokens: ['شبك'] },
    { label: 'حصان', matchTokens: ['حصان'] },
    { label: 'زمور', matchTokens: ['زمور'] },
    { label: 'غلل', matchTokens: ['غلل'] },
  ],
};

/**
 * دالة تطهير وتوحيد النصوص العربية
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/[أإآء]/g, 'ا') // توحيد الهمزات
    .replace(/ة/g, 'ه') // توحيد التاء المربوطة والهاء
    .replace(/ى/g, 'ي') // توحيد الألف المقصورة والياء
    .replace(/[a-zA-Z0-9\.\,\-\/\_\+\*\(\)\[\]\{\}\:\;\!\?\"\'\\\#\%\&\=]/g, ' ') // إزالة الرموز واللاتينية
    .replace(/[٠-٩]/g, ' ') // إزالة الأرقام العربية
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * تجزئة النص العربي إلى قائمة كلمات مستقلة (Tokens)
 */
export function tokenizeArabic(text: string): string[] {
  const normalized = normalizeArabic(text);
  if (!normalized) return [];
  return normalized.split(' ').filter((w) => w.length >= 2);
}

/**
 * مطابقة دقيقة قائمة على الكلمة المستقلة بالكامل (Whole-Word Token Matching)
 * ممنوع استخدام .includes() لمنع فخاخ التطابق الجزئي
 */
export function matchSubcategory(productNameAr: string, categoryCodePrefix: string): string | null {
  const defs = SUBCATEGORIES_BY_PREFIX[categoryCodePrefix];
  if (!defs || defs.length === 0) return null;

  const tokens = tokenizeArabic(productNameAr);
  if (tokens.length === 0) return null;

  // فحص الكلمات بترتيب ورودها بالاسم من اليمين لليسار (إعطاء الأولوية للاسم الجوهري الأول)
  for (const token of tokens) {
    for (const def of defs) {
      if (def.matchTokens.includes(token)) {
        return def.label;
      }
    }
  }

  return null;
}

export async function applySubcategories(options?: { dryRun?: boolean; batchSize?: number }) {
  const isDryRun = options?.dryRun ?? process.argv.includes('--dry-run');
  const batchSize = options?.batchSize ?? 100;

  console.log('================================================================================');
  console.log(`🚀 ${isDryRun ? 'تشغيل جاف تجريبي (Dry Run)' : 'تطبيق فعلي في قاعدة البيانات (Live Apply)'}: تسكين التفرعات`);
  console.log('================================================================================');

  const categories = await prisma.category.findMany({
    orderBy: { codePrefix: 'asc' },
    include: {
      products: {
        select: {
          id: true,
          matCode: true,
          nameAr: true,
          categoryId: true,
          subCategoryLabel: true,
        },
      },
    },
  });

  let totalProductsAll = 0;
  let totalMatchedAll = 0;
  const updatesToExecute: { id: number; subCategoryLabel: string }[] = [];

  for (const category of categories) {
    const totalCatProducts = category.products.length;
    totalProductsAll += totalCatProducts;

    console.log(`\n📁 قسم [${category.codePrefix}] ${category.nameAr} (إجمالي: ${totalCatProducts} منتج)`);
    console.log('--------------------------------------------------------------------------------');

    if (totalCatProducts === 0) {
      console.log('  ⚠️ لا توجد منتجات في هذا القسم.');
      continue;
    }

    const subcategoryCounts = new Map<string, number>();
    let matchedInCat = 0;

    for (const product of category.products) {
      const matchedLabel = matchSubcategory(product.nameAr, category.codePrefix);
      if (matchedLabel) {
        matchedInCat++;
        subcategoryCounts.set(matchedLabel, (subcategoryCounts.get(matchedLabel) || 0) + 1);
        updatesToExecute.push({
          id: product.id,
          subCategoryLabel: matchedLabel,
        });
      }
    }

    totalMatchedAll += matchedInCat;
    const coveragePct = ((matchedInCat / totalCatProducts) * 100).toFixed(1);
    const uncoveredCount = totalCatProducts - matchedInCat;
    const uncoveredPct = ((uncoveredCount / totalCatProducts) * 100).toFixed(1);

    // طباعة إحصائيات التفرعات للقسم
    const sortedSubcats = Array.from(subcategoryCounts.entries()).sort((a, b) => b[1] - a[1]);
    sortedSubcats.forEach(([label, count], idx) => {
      const pct = ((count / totalCatProducts) * 100).toFixed(1);
      const rank = (idx + 1).toString().padStart(2, ' ');
      console.log(`   ${rank}. ${label.padEnd(16, ' ')} : ${count.toString().padStart(4, ' ')} منتج (${pct}%)`);
    });

    console.log(`\n  📈 التغطية: ${matchedInCat}/${totalCatProducts} منتج (${coveragePct}%) | 📉 بدون تفرع: ${uncoveredCount} (${uncoveredPct}%)`);
  }

  const overallCoveragePct = ((totalMatchedAll / totalProductsAll) * 100).toFixed(1);
  console.log('\n================================================================================');
  console.log('📊 الإحصائيات الإجمالية للتسكين:');
  console.log(`- إجمالي المنتجات بكافة الأقسام: ${totalProductsAll} منتج`);
  console.log(`- المنتجات المسكنة بتفرع نقي: ${totalMatchedAll} منتج (${overallCoveragePct}%)`);
  console.log(`- المنتجات المتبقية كعامة: ${totalProductsAll - totalMatchedAll} منتج`);
  console.log('================================================================================');

  if (isDryRun) {
    console.log('🛡️ وضع التشغيل الجاف (--dry-run): لم يتم إجراء أي تعديل أو كتابة في قاعدة البيانات (Zero DB Writes).');
    return {
      dryRun: true,
      totalProducts: totalProductsAll,
      totalMatched: totalMatchedAll,
      coveragePct: overallCoveragePct,
    };
  }

  // التنفيذ الفعلي في قاعدة البيانات بدفعات مجزأة مع حماية المعاملات
  console.log(`\n💾 بدء الكتابة الفعلية لـ ${updatesToExecute.length} منتج على دفعات (حجم الدفعة: ${batchSize})...`);

  for (let i = 0; i < updatesToExecute.length; i += batchSize) {
    const batch = updatesToExecute.slice(i, i + batchSize);
    const batchIndex = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(updatesToExecute.length / batchSize);

    await prisma.$transaction(
      batch.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: {
            subCategoryLabel: item.subCategoryLabel,
          },
        })
      ),
      { maxWait: 10000, timeout: 60000 }
    );

    console.log(`  ✓ اكتملت الدفعة [${batchIndex}/${totalBatches}] بنجاح (${Math.min(i + batchSize, updatesToExecute.length)}/${updatesToExecute.length}).`);
  }

  console.log('✅ اكتمل التسكين الفعلي بنجاح بنسبة 100%. تم تحديث حقل subCategoryLabel حصراً دون المساس بـ categoryId.');

  return {
    dryRun: false,
    totalProducts: totalProductsAll,
    totalMatched: totalMatchedAll,
    coveragePct: overallCoveragePct,
  };
}

if (require.main === module) {
  applySubcategories()
    .catch((err) => {
      console.error('❌ خطأ أثناء تطبيق التفرعات:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
