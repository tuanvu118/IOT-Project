import { Link } from "react-router-dom";

function Vehicles() {
  return (
    <div>
      <h1>Phương tiện của tôi</h1>

      <Link to="/vehicles/add">
        <button>Thêm phương tiện</button>
      </Link>

      <p>Danh sách phương tiện sẽ hiển thị tại đây.</p>
    </div>
  );
}

export default Vehicles;