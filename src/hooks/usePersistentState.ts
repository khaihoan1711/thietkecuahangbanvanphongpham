"use client";

import { useEffect, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";

// Giống useState nhưng giá trị được lưu vào LocalStorage.
//
// - Lần render đầu tiên luôn dùng `seed` để HTML của server và của trình duyệt khớp nhau.
// - Sau khi trang tải xong, dữ liệu đã lưu được đọc lên và `isReady` chuyển thành true.
// - Chỉ ghi lại LocalStorage khi `isReady` là true, để không ghi đè dữ liệu cũ bằng dữ liệu mẫu.
// - Khi một tab khác thay đổi dữ liệu, tab này cũng được cập nhật theo.
// - Nếu dữ liệu đã lưu bị hỏng (không qua được `isValid`) thì quay về dữ liệu mẫu.
export function usePersistentState<T>(
  key: string,
  seed: T,
  isValid: (value: unknown) => boolean = () => true,
) {
  const [value, setValue] = useState<T>(seed);
  const [isReady, setIsReady] = useState(false);

  // Đọc dữ liệu đã lưu sau khi trình duyệt tải xong.
  useEffect(() => {
    const saved = readJson<unknown>(key, seed);

    setValue(isValid(saved) ? (saved as T) : seed);
    setIsReady(true);
  }, [key]);

  // Ghi lại mỗi khi dữ liệu thay đổi.
  useEffect(() => {
    if (!isReady) {
      return;
    }

    writeJson(key, value);
  }, [key, value, isReady]);

  // Đồng bộ khi tab khác thay đổi cùng khóa.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== key || event.newValue === null) {
        return;
      }

      try {
        const next: unknown = JSON.parse(event.newValue);

        if (isValid(next)) {
          setValue(next as T);
        }
      } catch {
        // Dữ liệu hỏng thì giữ nguyên giá trị hiện tại.
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  return [value, setValue, isReady] as const;
}
