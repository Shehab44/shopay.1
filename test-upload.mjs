
async function testUpload() {
  const formData = new FormData();
  formData.append("file", new Blob(["dummy image content"], { type: "image/png" }), "test.png");

  try {
    const res = await fetch("http://localhost:3000/api/v1/admin/products/6388/image", {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    console.log("Upload response:", res.status, text);
  } catch(e) {
    console.error("Fetch error:", e);
  }
}
testUpload();

