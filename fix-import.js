
const fs = require("fs");
const path = require("path");
const file = path.join("src", "app", "api", "v1", "admin", "import", "commit", "route.ts");
let content = fs.readFileSync(file, "utf8");
content = content.replace(/create:\s*\{\s*matCode:\s*item\.matCode,\s*nameAr:\s*item\.productName,\s*categoryId,\s*price:\s*item\.price,\s*isActive\s*\}/, "create: { matCode: item.matCode, nameAr: item.productName, categoryId, price: item.price, isActive, stockQuantity: 9999 }");
fs.writeFileSync(file, content);

