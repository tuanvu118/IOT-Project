function ChangePassword() {
  return (
    <div>
      <h1>Đổi mật khẩu</h1>

      <form>
        <input
          type="password"
          placeholder="Mật khẩu hiện tại"
        />

        <br />

        <input
          type="password"
          placeholder="Mật khẩu mới"
        />

        <br />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu mới"
        />

        <br />

        <button type="submit">
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;