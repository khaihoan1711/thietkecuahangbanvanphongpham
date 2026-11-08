// Đọc ảnh người dùng chọn và thu nhỏ để lưu vừa trong LocalStorage (khoảng 5 MB cho cả website).

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_SVG_SIZE = 200 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không đọc được tệp ảnh."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Tệp này không phải ảnh hợp lệ."));
    image.src = source;
  });
}

// Trả về ảnh dạng data URL đã thu nhỏ (cạnh dài nhất tối đa `maxSize` px).
export async function fileToDataUrl(file: File, maxSize = 640): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Vui lòng chọn một tệp ảnh (JPG, PNG, SVG...).");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5 MB.");
  }

  const dataUrl = await readAsDataUrl(file);

  // Ảnh SVG là dạng vector nên giữ nguyên, chỉ giới hạn dung lượng.
  if (file.type === "image/svg+xml") {
    if (file.size > MAX_SVG_SIZE) {
      throw new Error("Ảnh SVG quá lớn. Vui lòng chọn ảnh nhỏ hơn 200 KB.");
    }

    return dataUrl;
  }

  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");

  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext("2d");

  if (!context) {
    return dataUrl;
  }

  // Nền trắng để ảnh PNG trong suốt không bị đen khi chuyển sang JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.82);
}
