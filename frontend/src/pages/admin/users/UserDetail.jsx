import { useParams } from "react-router-dom";

function UserDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>Chi tiết người dùng</h1>
      <p>ID: {id}</p>
    </div>
  );
}

export default UserDetail;