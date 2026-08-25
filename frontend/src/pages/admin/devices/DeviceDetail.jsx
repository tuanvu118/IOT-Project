import { useParams } from "react-router-dom";

function DeviceDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>Chi tiết thiết bị</h1>
      <p>Mã thiết bị: {id}</p>
    </div>
  );
}

export default DeviceDetail;