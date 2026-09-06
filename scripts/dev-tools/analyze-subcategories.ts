/**
 * أداة تحليل تجريبي جاف منقحة: حساب تكرار الكلمات واستخراج مقترحات التفرعات بعد تنقية المواد والوحدات
 * (Refined Dry Run Word Frequency Subcategory Analysis)
 * 
 * الميزات المحدثة:
 * 1. استبعاد المواد الخام والتصنيع (بلاستيك، خشب، ستانلس، حديد، قزاز، نحاس، صوف...).
 * 2. استبعاد وحدات القياس والأرقام الفنية (وات، لتر، فولت، امبير، سم، متر، بار...).
 * 3. استبعاد الأوصاف العامة والأشكال وطرق الفتح (مدور، مسكة، غطاء، قفل، برم، كبس...).
 * 4. استبعاد الأوصاف الديموغرافية (رجالي، نسائي، ولادي، بناتي، شبابي...).
 * 5. دمج صيغ الجمع بالمفرد وتوحيد التهجئة (اقلام -> قلم، لمبات -> لمبه، انفيرتر -> انفرتر...).
 * 6. الإبقاء الصريح على فئة "فرد" في قسم ألعاب الأطفال بعد ثبوت دلالتها على مسدسات الألعاب.
 * 7. قراءة فقط (Strict Zero DB Writes): لا يتم إجراء أي تعديل على قاعدة البيانات.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. مصفوفات الاستبعاد الموسعة (Blacklists)
const STOP_WORDS = new Set([
  // الألوان بجميع صيغها وتأنيثها
  'ابيض', 'بيضاء', 'اسود', 'سوداء', 'احمر', 'حمراء', 'ازرق', 'زرقاء', 'اخضر', 'خضراء',
  'اصفر', 'صفراء', 'فضي', 'فضيه', 'ذهبي', 'ذهبيه', 'كحلي', 'كحليه', 'بني', 'بنيه',
  'رصاصي', 'رصاصيه', 'رمادي', 'رماديه', 'زهر', 'زهري', 'زهريه', 'وردي', 'ورديه',
  'برتقالي', 'برتقاليه', 'بيج', 'سكري', 'سكريه', 'شفاف', 'شفافه', 'ملون', 'ملونه', 'الوان', 'لونين',

  // المواد الخام والتصنيع
  'بلاستيك', 'خشب', 'ستانلس', 'حديد', 'قزاز', 'زجاج', 'نحاس', 'صوف', 'قطن', 'جلد',
  'فرو', 'فازلين', 'فلين', 'كرتون', 'توتياء', 'المنيوم', 'الومنيوم', 'المينيوم', 'ستيل', 'معدن',

  // وحدات القياس، الأرقام الفنية، والمواصفات
  'وات', 'واط', 'ليتر', 'لتر', 'لترين', 'فولت', 'امبير', 'مل', 'ملم', 'سم', 'متر',
  'كيلو', 'غرام', 'رطل', 'انش', 'بوصه', 'نمره', 'نمرة', 'مقاس', 'مقاسات', 'قياس', 'قياسات',
  'حجم', 'احجام', 'بار', 'ديجيتال', 'كيلوغرام', 'سنتيمتر', 'مليلتر', 'درجه',

  // الأوصاف العامة، الأشكال، وطرق الفتح والإغلاق
  'مدور', 'مربع', 'طويل', 'قصير', 'طري', 'قاسي', 'مسكه', 'مسكة', 'غطا', 'غطاء',
  'قفل', 'تلزيق', 'شريط', 'برم', 'كبس', 'مجوز', 'مفرد', 'عادي', 'دوبل', 'ثقيل',
  'خفيف', 'زراعي', 'صيني', 'اورنج', 'كرت', 'عكرت', 'علبه', 'بعلبه', 'طرد', 'كيس',
  'بكيس', 'ظرف', 'بظرف', 'قطعه', 'قطعة', 'قطع', 'طقم', 'جوز', 'دزينه', 'دزينة',
  'كرتونه', 'بكرتونه', 'رول', 'كبير', 'كبيره', 'صغير', 'صغيره', 'وسط', 'موديل',
  'نوع', 'انواع', 'رقم', 'جديد', 'قديم', 'رفيع', 'عريض',

  // الأوصاف الديموغرافية والجمهور المستهدف
  'رجالي', 'رجاليه', 'نسائي', 'نسائيه', 'نسواني', 'نسوانيه', 'ولادي', 'ولاديه',
  'بناتي', 'بناتيه', 'شبابي', 'شبابيه', 'اطفال', 'طفل', 'بيبي',

  // حروف الجر، العطف، الضمائر، والكلمات العامة غير التصنيفية
  'في', 'من', 'علي', 'على', 'الي', 'إلى', 'عن', 'مع', 'او', 'لا', 'ما', 'هو', 'هي', 'هم',
  'هذا', 'هذه', 'هذان', 'هاتان', 'هؤلاء', 'ذلك', 'تلك', 'التي', 'الذي', 'الذين', 'ان',
  'كل', 'جميع', 'غير', 'ضد', 'ذو', 'ذات', 'بدون', 'حتي', 'عند', 'بين', 'تحت', 'فوق',
  'امام', 'خلف', 'خلال', 'فقط', 'جدا', 'لكن', 'ثم', 'بل', 'هل', 'كم', 'متي', 'اين', 'كيف',
  'سعر', 'اسعار', 'ماركه', 'اصلي', 'اورجينال', 'نخب', 'ممتاز', 'فاخر', 'سوبر', 'للاستخدام',
  'متعدد', 'مختلف', 'بفل', 'كيمي', 'يارا'
]);

// 2. جدول دمج المفرد والجمع والمترادفات (Normalization & Aliases)
const WORD_ALIASES: Record<string, string> = {
  // دمج صيغ الجمع بالمفرد
  'اقلام': 'قلم',
  'قلمان': 'قلم',
  'لمبات': 'لمبه',
  'شواحن': 'شاحن',
  'طناجر': 'طنجره',
  'صحون': 'صحن',
  'كاسات': 'كاسه',
  'كفوف': 'كف',
  'دفاتر': 'دفتر',
  'مفاتيح': 'مفتاح',
  'شحاطات': 'شحاط',
  'شناتي': 'شنطه',
  'شنات': 'شنطه',
  'شنط': 'شنطه',
  'محايات': 'محايه',
  'برايات': 'برايه',
  'مسامير': 'مسمار',
  'براغي': 'برغي',
  'بطاريات': 'بطاريه',
  'فراشي': 'فرشاه',
  'فرشايا': 'فرشاه',

  // توحيد التهجئة والمترادفات الشائعة
  'انفيرتر': 'انفرتر',
  'فرشايه': 'فرشاه',
};

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/[أإآء]/g, 'ا') // توحيد الهمزات
    .replace(/ة/g, 'ه') // توحيد التاء المربوطة والهاء
    .replace(/ى/g, 'ي') // توحيد الألف المقصورة والياء
    .replace(/[a-zA-Z0-9\.\,\-\/\_\+\*\(\)\[\]\{\}\:\;\!\?\"\'\\\#\%\&\=]/g, ' ') // إزالة اللاتينية والأرقام والرموز
    .replace(/[٠-٩]/g, ' ') // إزالة الأرقام العربية
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAndExtractWords(name: string): string[] {
  const normalized = normalizeArabic(name);
  const rawWords = normalized.split(' ').map((w) => w.trim());

  const processedWords: string[] = [];

  for (const rawWord of rawWords) {
    if (rawWord.length < 3) continue;

    // تطبيق جدول الدمج والمترادفات أولاً
    const mappedWord = WORD_ALIASES[rawWord] || rawWord;

    // استبعاد الكلمات المحظورة
    if (!STOP_WORDS.has(mappedWord)) {
      processedWords.push(mappedWord);
    }
  }

  return processedWords;
}

async function analyzeSubcategories() {
  console.log('================================================================================');
  console.log('📊 تقرير التحليل التجريبي الجاف المنقح لتكرار الكلمات والتفرعات (Refined Dry Run)');
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
  // تأكيد الإبقاء الصريح على فئة "فرد" في قسم ألعاب الأطفال
  // -------------------------------------------------------------
  console.log('================================================================================');
  console.log('🎯 [تأكيد الاعتماد]: الإبقاء الصريح على فئة "فرد" في قسم ألعاب الأطفال');
  console.log('================================================================================');

  const toysCategory = categories.find((c) => c.codePrefix === '106' || c.nameAr.includes('ألعاب'));

  if (toysCategory) {
    const fardProducts = toysCategory.products.filter((p) => {
      const words = cleanAndExtractWords(p.nameAr);
      return words.includes('فرد');
    });

    console.log(`✅ تم تأكيد بقاء فئة "فرد" كفئة مستقلة (مسدسات ألعاب): تضم ${fardProducts.length} منتج`);
    console.log('نماذج من أسماء المنتجات تحت هذه الفئة:');

    const sampleProducts = fardProducts.slice(0, 6);
    sampleProducts.forEach((p, idx) => {
      console.log(`   ${idx + 1}. [كود: ${p.matCode}] ${p.nameAr}`);
    });
  }

  console.log('\n================================================================================');
  console.log('✅ اكتمل التحليل الجاف المنقح (Dry Run) بنجاح - تم استبعاد المواد والوحدات والدمج دون أي كتابة في DB.');
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

