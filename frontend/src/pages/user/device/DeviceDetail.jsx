import { Link, useParams } from "react-router-dom";

function DeviceDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>Chi tiết thiết bị</h1>

      <p>Mã thiết bị: {id}</p>
      <p>Trạng thái: --</p>
      <p>GPS: --</p>
      <p>Cảm biến: --</p>
      <p>Thời gian cập nhật cuối: --</p>

      <button>Bật / Tắt chống trộm</button>

      <br />

      <Link to={`/devices/${id}/sensors`}>
        Xem dữ liệu cảm biến
      </Link>
    </div>
  );
}

export default DeviceDetail;