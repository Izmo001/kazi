import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";

interface User {
  _id: string;
  name: string;
  email: string;
}

const AdminDashboard = () => {
  const { token } = useContext(AuthContext)!;
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
  axios.get<User[]>("/users", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then((res) => setUsers(res.data));
    }, [token]);

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      {users.map(user => (
        <div key={user._id} className="card">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;