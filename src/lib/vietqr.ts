import qrcode from "qrcode-generator";

// Tài khoản nhận tiền của cửa hàng.
// Mã ngân hàng (BIN) và số tài khoản lấy từ mã VietQR gốc của cửa hàng.
export const BANK = {
  bin: "970436",
  name: "Vietcombank",
  accountName: "DUONG KHAI HOAN",
  accountNumber: "1029119451",
};

// Một trường theo chuẩn EMVCo: mã (2 số) + độ dài (2 số) + giá trị.
function field(id: string, value: string) {
  return id + String(value.length).padStart(2, "0") + value;
}

// Mã kiểm tra CRC16-CCITT (chuẩn VietQR yêu cầu ở cuối nội dung QR).
function crc16(text: string) {
  let crc = 0xffff;

  for (let index = 0; index < text.length; index += 1) {
    crc ^= text.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Nội dung mã VietQR có sẵn số tiền và nội dung chuyển khoản (mã đơn hàng).
export function vietQrPayload(amount: number, content: string) {
  const account =
    field("00", "A000000727") +
    field("01", field("00", BANK.bin) + field("01", BANK.accountNumber)) +
    field("02", "QRIBFTTA");
  const body =
    field("00", "01") +
    field("01", "12") +
    field("38", account) +
    field("53", "704") +
    field("54", String(Math.round(amount))) +
    field("58", "VN") +
    field("62", field("08", content)) +
    "6304";

  return body + crc16(body);
}

// Ảnh mã QR (dạng data URL) để quét bằng ứng dụng ngân hàng.
export function vietQrImage(amount: number, content: string) {
  const qr = qrcode(0, "M");

  qr.addData(vietQrPayload(amount, content));
  qr.make();

  return qr.createDataURL(6, 4);
}
