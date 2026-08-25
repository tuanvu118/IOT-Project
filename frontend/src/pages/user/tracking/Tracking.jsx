function Tracking() {
  const handleUpdateLocation = () => {
    console.log("Yêu cầu cập nhật vị trí GPS");
  };

  return (
    <div>
      <h1>Theo dõi vị trí</h1>

      <section>
        <h2>Bản đồ</h2>
        <p>Bản đồ vị trí phương tiện sẽ hiển thị tại đây.</p>
      </section>

      <section>
        <p>Kinh độ: --</p>
        <p>Vĩ độ: --</p>
        <p>Trạng thái GPS: --</p>
        <p>Thời gian cập nhật: --</p>
      </section>

      <button onClick={handleUpdateLocation}>
        Cập nhật vị trí
      </button>
    </div>
  );
}

export default Tracking;