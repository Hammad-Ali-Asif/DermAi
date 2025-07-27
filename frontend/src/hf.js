
// src/api/hf.js
export async function detectAcne(imageFile) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/<your-username>/dermai-acne-detector",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageFile,
    }
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF inference failed: ${err}`);
  }
  return response.json();
}
