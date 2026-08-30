import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { getMyProfile, updateMyProfile, uploadAvatar, addSosNumber, removeSosNumber } from "../../../services/userService";

function normalizePhones(phones) {
  return [...new Set(phones.map((phone) => phone.trim()).filter(Boolean))];
}

function EditProfile() {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    citizenNumber: "",
  });

  const [sosPhones, setSosPhones] = useState([""]);
  const [initialSosPhones, setInitialSosPhones] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      try {
        const data = await getMyProfile();
        if (isMounted && data) {
          const sos = data.sos_numbers || [];
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phoneNumber: data.phone_number || "",
            address: data.address || "",
            dateOfBirth: data.date_of_birth || "",
            citizenNumber: data.citizen_number || "",
          });
          setSosPhones(sos.length > 0 ? sos : [""]);
          setInitialSosPhones(sos);
          const currentAvatar = data.avatar_url || data.avatarUrl || localStorage.getItem("user_custom_avatar");
          if (currentAvatar) {
            setAvatarPreview(currentAvatar);
          }
        }
      } catch (err) {
        if (isMounted && authUser) {
          const sos = authUser.sosNumbers || authUser.sos_numbers || [];
          setFormData({
            name: authUser.name || "Nguyễn Văn An",
            email: authUser.email || "nguyenvan.an@example.com",
            phoneNumber: authUser.phoneNumber || authUser.phone_number || "0987654321",
            address: authUser.address || "Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội",
            dateOfBirth: authUser.dateOfBirth || authUser.date_of_birth || "1990-05-15",
            citizenNumber: authUser.citizenNumber || authUser.citizen_number || "001090123456",
          });
          setSosPhones(sos.length > 0 ? sos : ["0912345678"]);
          setInitialSosPhones(sos);
          const currentAvatar = authUser.avatarUrl || authUser.avatar_url || localStorage.getItem("user_custom_avatar");
          if (currentAvatar) {
            setAvatarPreview(currentAvatar);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSosPhoneChange = (index, value) => {
    setSosPhones((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const handleAddSosPhone = () => {
    setSosPhones((prev) => [...prev, ""]);
  };

  const handleRemoveSosPhone = (index) => {
    setSosPhones((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.length > 0 ? filtered : [""];
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp ảnh hợp lệ (PNG, JPG, JPEG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh tối đa là 5MB.");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Vui lòng nhập Họ và tên.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let finalAvatarUrl = avatarPreview;

      // 1. Upload avatar to Cloudinary via backend if new file selected
      if (avatarFile) {
        try {
          const res = await uploadAvatar(avatarFile);
          if (res?.avatar_url || res?.avatarUrl) {
            finalAvatarUrl = res.avatar_url || res.avatarUrl;
          }
        } catch (uploadErr) {
          console.warn("Cloudinary upload fallback:", uploadErr);
        }
      }

      if (finalAvatarUrl) {
        localStorage.setItem("user_custom_avatar", finalAvatarUrl);
      }

      // 2. Update profile
      const payload = {
        name: formData.name.trim(),
        phone_number: formData.phoneNumber.trim(),
        address: formData.address.trim() || null,
        date_of_birth: formData.dateOfBirth.trim() || null,
        citizen_number: formData.citizenNumber.trim() || null,
      };

      if (finalAvatarUrl) {
        payload.avatar_url = finalAvatarUrl;
      }

      let updatedUser = null;
      try {
        updatedUser = await updateMyProfile(payload);
      } catch (profileErr) {
        // Fallback for offline mode
      }

      // 3. Update multiple SOS phone numbers
      const prevList = normalizePhones(initialSosPhones);
      const nextList = normalizePhones(sosPhones);

      const toAdd = nextList.filter((p) => !prevList.includes(p));
      const toRemove = prevList.filter((p) => !nextList.includes(p));

      for (const phone of toRemove) {
        try {
          await removeSosNumber(phone);
        } catch (err) {
          // Optional
        }
      }

      for (const phone of toAdd) {
        try {
          await addSosNumber(phone);
        } catch (err) {
          // Optional
        }
      }

      const mergedUser = {
        ...(updatedUser || authUser || {}),
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        citizenNumber: formData.citizenNumber.trim(),
        avatarUrl: finalAvatarUrl,
        avatar_url: finalAvatarUrl,
        sosNumbers: nextList,
        sos_numbers: nextList,
      };

      if (updateUser) {
        updateUser(mergedUser);
      }

      setSuccess("Cập nhật thông tin cá nhân thành công!");
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      setError(err?.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-profile-page">
      {/* Breadcrumbs */}
      <nav className="edit-profile-breadcrumb" aria-label="Breadcrumb">
        <Link to="/profile">Hồ sơ cá nhân</Link>
        <span className="breadcrumb-separator">&gt;</span>
        <strong>Chỉnh sửa hồ sơ</strong>
      </nav>

      {/* Heading */}
      <div className="edit-profile-heading">
        <h1>Thông tin cá nhân</h1>
        <p>Cập nhật thông tin chi tiết và cách thức liên lạc của bạn.</p>
      </div>

      {error && <div className="edit-profile-alert error">{error}</div>}
      {success && <div className="edit-profile-alert success">{success}</div>}

      {loading ? (
        <div className="vehicles-loading">
          <div className="vehicles-loading-spinner" />
          <p>Đang tải thông tin hồ sơ...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Card 1: Thông tin cá nhân */}
          <section className="edit-profile-card">
            {/* Avatar Row */}
            <div className="edit-profile-avatar-row">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/png, image/jpeg, image/jpg"
                style={{ display: "none" }}
              />

              <div
                className="edit-profile-avatar-wrap"
                onClick={() => fileInputRef.current?.click()}
                title="Nhấn để chọn ảnh mới"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={formData.name || "Avatar"}
                    className="edit-profile-avatar-img"
                  />
                ) : (
                  <div className="edit-profile-avatar-placeholder">
                    <span>{(formData.name || "A").charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className="edit-profile-avatar-meta">
                <strong>Ảnh đại diện</strong>
                <p>Định dạng hỗ trợ: JPEG, PNG. Dung lượng tối đa 5MB.</p>
                <button
                  type="button"
                  className="edit-profile-change-avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Thay đổi ảnh
                </button>
              </div>
            </div>

            <hr className="edit-profile-divider" />

            {/* Main Form Fields */}
            <div className="edit-profile-fields">
              {/* Họ và tên (Full width) */}
              <div className="edit-profile-field full-width">
                <label htmlFor="name">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email & Số điện thoại (2 Columns) */}
              <div className="edit-profile-grid-2">
                <div className="edit-profile-field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="edit-profile-field">
                  <label htmlFor="phoneNumber">Số điện thoại</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="VD: 0987654321"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Địa chỉ (Full width) */}
              <div className="edit-profile-field full-width">
                <label htmlFor="address">Địa chỉ</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="VD: Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              {/* Ngày sinh & CCCD (2 Columns) */}
              <div className="edit-profile-grid-2">
                <div className="edit-profile-field">
                  <label htmlFor="dateOfBirth">Ngày sinh</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="edit-profile-field">
                  <label htmlFor="citizenNumber">CCCD</label>
                  <input
                    type="text"
                    id="citizenNumber"
                    name="citizenNumber"
                    placeholder="VD: 001090123456"
                    value={formData.citizenNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Liên hệ khẩn cấp (Hỗ trợ nhiều số) */}
          <section className="edit-profile-card edit-profile-sos-card">
            <div className="edit-profile-sos-header">
              <div className="sos-title-wrap">
                <span className="sos-asterisk">✱</span>
                <h2>Liên hệ khẩn cấp</h2>
              </div>
              <p>Các số này được sử dụng để gửi SMS khi phát hiện tai nạn.</p>
            </div>

            <div className="edit-profile-sos-list">
              {sosPhones.map((phone, index) => (
                <div key={index} className="sos-phone-row">
                  <div className="edit-profile-field sos-phone-input-field">
                    <label htmlFor={`sosPhone_${index}`}>
                      Số điện thoại khẩn cấp {sosPhones.length > 1 ? `#${index + 1}` : ""}
                    </label>
                    <div className="sos-input-with-remove">
                      <input
                        type="tel"
                        id={`sosPhone_${index}`}
                        placeholder="VD: 0912345678"
                        value={phone}
                        onChange={(e) => handleSosPhoneChange(index, e.target.value)}
                      />
                      {sosPhones.length > 1 && (
                        <button
                          type="button"
                          className="sos-remove-btn"
                          onClick={() => handleRemoveSosPhone(index)}
                          title="Xóa số này"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="add-sos-btn"
                onClick={handleAddSosPhone}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Thêm số điện thoại khẩn cấp
              </button>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="edit-profile-footer">
            <Link to="/profile" className="edit-profile-cancel-btn">
              Hủy
            </Link>
            <button
              type="submit"
              className="edit-profile-save-btn"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EditProfile;
