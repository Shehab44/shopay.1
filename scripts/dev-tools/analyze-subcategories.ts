/**
 * أداة تحليل تجريبي جاف: حساب تكرار الكلمات واستخراج مقترحات التفرعات (Dry Run)
 * 
 * الهدف والفائدة:
 * 1. استخراج الكلمات الدالة الأكثر تكراراً (12 إلى 15 كلمة) لكل قسم من الأقسام الـ 14 مع حساب نسبة تغطيتها.
 * 2. فحص وتدقيق سياق كلمة "فرد" في قسم ألعاب الأطفال لاستعراض عينات من المنتجات التي تحتويها.
 * 3. قراءة فقط (Strict Zero DB Writes): لا يتم استدعاء أي دالة تعديل أو كتابة على قاعدة البيانات.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// قائمة الكلمات المستبعدة (Stopwords): الألوان، وحدات القياس والتعبئة، والكلمات العامة غير الدالة
const STOP_WORDS = new Set([
  // الألوان بجميع صيغها وتأنيثها
  'ابيض', 'بيضاء', 'اسود', 'سوداء', 'احمر', 'حمراء', 'ازرق', 'زرقاء', 'اخضر', 'خضراء',
  'اصفر', 'صفراء', 'فضي', 'فضيه', 'ذهبي', 'ذهبيه', 'كحلي', 'كحليه', 'بني', 'بنيه',
  'رصاصي', 'رصاصيه', 'رمادي', 'رماديه', 'زهر', 'زهري', 'زهريه', 'وردي', 'ورديه',
  'برتقالي', 'برتقاليه', 'بيج', 'سكري', 'سكريه', 'شفاف', 'شفافه', 'ملون', 'ملونه', 'الوان',

  // طرق التعبئة والتغليف، الوحدات، والأحجام
  'كرت', 'عكرت', 'علبه', 'بعلبه', 'طرد', 'كيس', 'بكيس', 'ظرف', 'بظرف', 'قطعه', 'قطعة', 'قطع',
  'طقم', 'جوز', 'دزينه', 'دزينة', 'كرتونه', 'كرتونة', 'بكرتونه', 'رول', 'متر', 'سم', 'مل',
  'ملم', 'لتر', 'لترين', 'كيلو', 'غرام', 'كبير', 'كبيره', 'صغير', 'صغيره', 'وسط',
  'قياس', 'نمره', 'نمرة', 'حجم', 'احجام', 'موديل', 'نوع', 'انواع', 'رقم', 'جديد', 'قديم',
  'واط', 'فولت', 'امبير', 'انش', 'بوصه', 'بوصة', 'كيلوغرام', 'سنتيمتر', 'مليلتر',

  // حروف الجر، العطف، الضمائر، والكلمات العامة غير التصنيفية
  'في', 'من', 'علي', 'على', 'الي', 'إلى', 'عن', 'مع', 'او', 'لا', 'ما', 'هو', 'هي', 'هم',
  'هذا', 'هذه', 'هذان', 'هاتان', 'هؤلاء', 'ذلك', 'تلك', 'التي', 'الذي', 'الذين', 'ان', 'أن', 'إن',
  'كل', 'جميع', 'غير', 'ضد', 'ذو', 'ذات', 'بدون', 'حتي', 'حتى', 'عند', 'بين', 'تحت', 'فوق',
  'امام', 'خلف', 'خلال', 'فقط', 'جدا', 'لكن', 'ثم', 'بل', 'هل', 'كم', 'متي', 'اين', 'كيف',
  'سعر', 'اسعار', 'ماركه', 'اصلي', 'اورجينال', 'نخب', 'ممتاز', 'فاخر', 'سوبر', 'للاستخدام',
  'متعدد', 'مختلف'
]);

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/[أإآء]/g, 'ا') // توحيد الهمزات
    .replace(/ة/g, 'ه') // توحيد التاء المربوطة والهاء
    .replace(/ى/g, 'ي') // توحيد الألف المقصورة والياء
    .replace(/[a-zA-Z0-9\.\,\-\/\_\+\*\(\)\[\]\{\}\:\;\!\?\"\'\\\#\%\&\=]/g, ' ') // إزالة اللاتينية والأرقام والرموز
    .replace(/[٠-٩]/g, ' ') // إزالة الأرقام العربية
    .replace(/\s+/g, ' ') // تقليص المسافات المتكررة
    .trim();
}

function cleanAndExtractWords(name: string): string[] {
  const normalized = normalizeArabic(name);
  const rawWords = normalized.split(' ').map((w) => w.trim());

  // استبقاء الكلمات المكونة من 3 أحرف فأكثر وغير المدرجة في قائمة الاستبعاد
  return rawWords.filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

async function analyzeSubcategories() {
  console.log('================================================================================');
  console.log('📊 تقرير التحليل التجريبي الجاف لتكرار الكلمات والتفرعات المقترحة (Dry Run)');
  console.log('================================================================================');

  // استعلام قراءة فقط (Strict Zero DB Writes)
  const categories = await prisma.category.findMany({
    orderBy: { codePrefix: 'asc' },
    include: {
      products: {
        select: {
          id: true,
          matCode: true,
          nameAr: true,
        },
      },
    },
  });

  const totalAllProducts = categories.reduce((acc, c) => acc + c.products.length, 0);
  console.log(`إجمالي الأقسام المحللة: ${categories.length} قسم | إجمالي المنتجات: ${totalAllProducts} منتج\n`);

  for (const category of categories) {
    const totalProducts = category.products.length;
    console.log('--------------------------------------------------------------------------------');
    console.log(`📁 قسم [${category.codePrefix}] ${category.nameAr} (إجمالي المنتجات: ${totalProducts})`);
    console.log('--------------------------------------------------------------------------------');

    if (totalProducts === 0) {
      console.log('  ⚠️ لا توجد منتجات مسجلة في هذا القسم.\n');
      continue;
    }

    const wordCounts = new Map<string, number>();

    // حساب تكرار الكلمات لكل منتج (كل كلمة تُحتسب مرة واحدة لكل منتج)
    for (const product of category.products) {
      const words = cleanAndExtractWords(product.nameAr);
      const uniqueWordsInProduct = new Set(words);
      for (const word of uniqueWordsInProduct) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }

    // ترتيب الكلمات تنازلياً حسب التكرار واختيار أعلى 12 إلى 15 كلمة
    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count >= 2);

    const topCandidates = sortedWords.slice(0, 15);

    if (topCandidates.length === 0) {
      console.log('  لا توجد كلمات متكررة بشكل كافٍ لإنشاء تفرعات.\n');
      continue;
    }

    console.log('  أعلى الكلمات الدالة المتكررة ومعدل تكرارها ونسبة تغطيتها:');
    topCandidates.forEach(([word, count], idx) => {
      const percentage = ((count / totalProducts) * 100).toFixed(1);
      const rank = (idx + 1).toString().padStart(2, ' ');
      console.log(`   ${rank}. ${word.padEnd(16, ' ')} : ${count.toString().padStart(4, ' ')} منتج (${percentage}%)`);
    });

    // حساب إجمالي المنتجات المغطاة بكلمة واحدة على الأقل من المرشحات
    const candidateWordSet = new Set(topCandidates.map(([word]) => word));
    let coveredProductsCount = 0;

    for (const product of category.products) {
      const words = cleanAndExtractWords(product.nameAr);
      if (words.some((w) => candidateWordSet.has(w))) {
        coveredProductsCount++;
      }
    }

    const coveragePct = ((coveredProductsCount / totalProducts) * 100).toFixed(1);
    const uncoveredCount = totalProducts - coveredProductsCount;
    const uncoveredPct = ((uncoveredCount / totalProducts) * 100).toFixed(1);

    console.log(`\n  📈 ملخص التغطية: تم تغطية ${coveredProductsCount} من أصل ${totalProducts} منتج (${coveragePct}%)`);
    console.log(`  📉 المنتجات غير المغطاة (تفرع عام أو فردي): ${uncoveredCount} منتج (${uncoveredPct}%)\n`);
  }

  // -------------------------------------------------------------
  // فحص خاص لسياق كلمة "فرد" في قسم ألعاب الأطفال
  // -------------------------------------------------------------
  console.log('================================================================================');
  console.log('🔍 [فحص تدقيق خاص]: تحليل سياق كلمة "فرد" في قسم "ألعاب أطفال"');
  console.log('================================================================================');

  const toysCategory = categories.find((c) => c.codePrefix === '106' || c.nameAr.includes('ألعاب'));

  if (toysCategory) {
    const fardProducts = toysCategory.products.filter((p) => {
      const normalized = normalizeArabic(p.nameAr);
      const words = normalized.split(' ');
      return words.includes('فرد');
    });

    console.log(`إجمالي المنتجات التي تحتوي كلمة "فرد" في قسم ألعاب الأطفال: ${fardProducts.length} منتج`);
    console.log('نماذج لأسماء المنتجات الكاملة للتدقيق الدلالي:');

    const sampleProducts = fardProducts.slice(0, 6);
    sampleProducts.forEach((p, idx) => {
      console.log(`   ${idx + 1}. [كود: ${p.matCode}] ${p.nameAr}`);
    });

    console.log('\nالاستنتاج الدلالي: كلمة "فرد" في هذا القسم تعني (مسدس لعبة / Toy Gun) باللهجة المحلية (مثل فرد خرز، فرد فقاعات، فرد مي).');
  } else {
    console.log('لم يتم العثور على قسم ألعاب الأطفال.');
  }

  console.log('\n================================================================================');
  console.log('✅ اكتمل التحليل الجاف (Dry Run) بنجاح - لم يتم إجراء أي تعديل على قاعدة البيانات.');
  console.log('================================================================================');
}

analyzeSubcategories()
  .catch((e) => {
    console.error('خطأ أثناء التحليل:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
