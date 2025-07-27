
// src/api/hf.js
export async function detectAcne(imageFile) {
  const response = await fetch(
  "https://huggingface.co/hammadali11/dermai-acne-detector/blob/main/acne_cnn_model.h5",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body: imageFile,  // your File or Blob
  }
);
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF inference failed: ${err}`);
  }
  return response.json();
}
