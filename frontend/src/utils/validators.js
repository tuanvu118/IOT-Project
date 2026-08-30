/**
 * Tiện ích kiểm tra và xác thực dữ liệu đầu vào (Validation Helpers)
 */

// 1. Kiểm tra Email: phải có dạng xxx@gmail.com
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return "Vui lòng nhập địa chỉ email.";
  }
  const cleanEmail = email.trim().toLowerCase();
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailRegex.test(cleanEmail)) {
    return "Email phải có định dạng @gmail.com (ví dụ: example@gmail.com).";
  }
  return "";
}

// 2. Kiểm tra Số điện thoại: đúng 10 số, bắt đầu bằng số 0
export function validatePhoneNumber(phone) {
  if (!phone || !phone.trim()) {
    return "Vui lòng nhập số điện thoại.";
  }
  const cleanPhone = phone.trim();
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.";
  }
  return "";
}

// 3. Kiểm tra Mật khẩu: dài từ 8-20 ký tự, chỉ gồm chữ và số, không có ký tự đặc biệt
export function validatePassword(password) {
  if (!password) {
    return "Vui lòng nhập mật khẩu.";
  }
  if (password.length < 8 || password.length > 20) {
    return "Mật khẩu phải dài từ 8 đến 20 ký tự.";
  }
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(password)) {
    return "Mật khẩu chỉ được chứa chữ cái và số, không được chứa ký tự đặc biệt.";
  }
  return "";
}

// 4. Kiểm tra Họ và tên
export function validateFullName(name) {
  if (!name || !name.trim()) {
    return "Vui lòng nhập họ và tên.";
  }
  const cleanName = name.trim();
  if (cleanName.length < 2 || cleanName.length > 50) {
    return "Họ và tên phải từ 2 đến 50 ký tự.";
  }
  return "";
}

// 5. Kiểm tra Căn cước công dân (CCCD): 12 chữ số
export function validateCitizenNumber(cccd) {
  if (!cccd || !cccd.trim()) {
    return ""; // Tùy chọn
  }
  const cleanCccd = cccd.trim();
  const cccdRegex = /^[0-9]{12}$/;
  if (!cccdRegex.test(cleanCccd)) {
    return "Số CCCD phải gồm đúng 12 chữ số.";
  }
  return "";
}

// 6. Kiểm tra Mã thiết bị IoT
export function validateDeviceCode(code) {
  if (!code || !code.trim()) {
    return "Vui lòng nhập mã thiết bị IoT.";
  }
  if (code.trim().length < 3) {
    return "Mã thiết bị không hợp lệ (tối thiểu 3 ký tự).";
  }
  return "";
}

// 7. Kiểm tra Biển số xe máy
export function validateLicensePlate(plate) {
  if (!plate || !plate.trim()) {
    return "Vui lòng nhập biển số xe.";
  }
  const cleanPlate = plate.trim();
  if (cleanPlate.length < 5 || cleanPlate.length > 20) {
    return "Biển số xe phải từ 5 đến 20 ký tự (ví dụ: 29A1-123.45).";
  }
  return "";
}

// 8. Kiểm tra Mã xác nhận bí mật của thiết bị (Secret/PIN code)
export function validateSecretCode(secret) {
  if (!secret || !secret.trim()) {
    return "Vui lòng nhập mã xác nhận bí mật của thiết bị.";
  }
  const cleanSecret = secret.trim();
  if (cleanSecret.length < 4 || cleanSecret.length > 20) {
    return "Mã xác nhận bảo mật phải từ 4 đến 20 ký tự.";
  }
  return "";
}
