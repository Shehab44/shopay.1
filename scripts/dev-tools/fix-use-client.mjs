import fs from 'fs';

const files = [
  'src/app/(storefront)/cart/page.tsx',
  'src/app/(storefront)/checkout/page.tsx',
  'src/components/product/ProductClient.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove "use client"; from wherever it is
  content = content.replace(/"use client";\r?\n?/g, '');
  content = content.replace(/'use client';\r?\n?/g, '');
  
  // Prepend "use client";
  content = '"use client";\n' + content;
  
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}

