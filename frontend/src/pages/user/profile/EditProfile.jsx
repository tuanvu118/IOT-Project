function EditProfile() {
  return (
    <div>
      <h1>Cập nhật hồ sơ</h1>

      <form>
        <input placeholder="Họ và tên" />
        <br />

        <input placeholder="Số điện thoại" />
        <br />

        <input placeholder="Tên người thân" />
        <br />

        <input placeholder="Số điện thoại người thân" />
        <br />

        <button type="submit">Lưu thay đổi</button>
      </form>
    </div>
  );
}

export default EditProfile;