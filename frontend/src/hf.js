export async function detectAcne(imageFile) {
  const HF_API_URL =
    "https://api-inference.huggingface.co/models/hammadali11/dermai-acne-detector";

  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body: imageFile,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF inference failed: ${res.status} ${text}`);
  }
  return res.json();
}
