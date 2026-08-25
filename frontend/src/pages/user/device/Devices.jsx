import { Link } from "react-router-dom";

function Devices() {
  return (
    <div>
      <h1>Danh sách thiết bị</h1>

      <Link to="/devices/link">
        <button>Liên kết thiết bị</button>
      </Link>

      <p>Danh sách thiết bị IoT sẽ hiển thị tại đây.</p>
    </div>
  );
}

export default Devices;