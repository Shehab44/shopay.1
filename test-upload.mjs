
async function testUpload() {
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const binary = Buffer.from(pngBase64, "base64");
  const formData = new FormData();
  formData.append("file", new Blob([binary], { type: "image/png" }), "test.png");
  try {
    const res = await fetch("http://localhost:3000/api/v1/test-upload", { method: "POST", body: formData });
    const text = await res.text();
    console.log(`Status: ${res.status}, Response: ${text}`);
  } catch(e) {
    console.error(e);
  }
}
testUpload();

