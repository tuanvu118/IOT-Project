function AddVehicle() {
  return (
    <div>
      <h1>Thêm phương tiện</h1>

      <form>
        <input placeholder="Biển số xe" />
        <br />

        <input placeholder="Tên xe" />
        <br />

        <input placeholder="Hãng xe" />
        <br />

        <input placeholder="Loại xe" />
        <br />

        <button type="submit">
          Thêm phương tiện
        </button>
      </form>
    </div>
  );
}

export default AddVehicle;