// Bản chép tay của src/lib/vietqr.ts cho bản HTML. Sửa một bên thì sửa cả bên kia.
// Hàm qrcode(...) đến từ thư viện qrcode-generator, được nhúng ngay trước file này.

// Tài khoản nhận tiền của cửa hàng.
// Mã ngân hàng (BIN) và số tài khoản lấy từ mã VietQR gốc của cửa hàng.
const BANK = {
  bin: "970436",
  name: "Vietcombank",
  accountName: "DUONG KHAI HOAN",
  accountNumber: "1029119451",
};

// Một trường theo chuẩn EMVCo: mã (2 số) + độ dài (2 số) + giá trị.
function qrField(id, value) {
  return id + String(value.length).padStart(2, "0") + value;
}

// Mã kiểm tra CRC16-CCITT (chuẩn VietQR yêu cầu ở cuối nội dung QR).
function qrCrc16(text) {
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
function vietQrPayload(amount, content) {
  const account =
    qrField("00", "A000000727") +
    qrField("01", qrField("00", BANK.bin) + qrField("01", BANK.accountNumber)) +
    qrField("02", "QRIBFTTA");
  const body =
    qrField("00", "01") +
    qrField("01", "12") +
    qrField("38", account) +
    qrField("53", "704") +
    qrField("54", String(Math.round(amount))) +
    qrField("58", "VN") +
    qrField("62", qrField("08", content)) +
    "6304";

  return body + qrCrc16(body);
}

// Ảnh mã QR (dạng data URL) để quét bằng ứng dụng ngân hàng.
function vietQrImage(amount, content) {
  const qr = qrcode(0, "M");

  qr.addData(vietQrPayload(amount, content));
  qr.make();

  return qr.createDataURL(6, 4);
}
