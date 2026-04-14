import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";

const User = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // OPEN DELETE MODAL
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  // DELETE USER
  const deleteUser = async () => {
    try {
      await axios.delete(`http://localhost:8000/users/${deleteId}`);
      setShowModal(false);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // TOGGLE BLOCK / UNBLOCK
  const toggleUser = async (id) => {
    try {
      await axios.put(`http://localhost:8000/users/${id}/toggle`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // UPDATE USER
  const updateUser = async () => {
    try {
      await axios.put(
        `http://localhost:8000/users/${editingUser.id}`,
        {
          name: editingUser.name,
          email: editingUser.email,
        }
      );

      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">

              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>

              <td className="p-3">
                {u.is_active ? "🟢 Active" : "🔴 Blocked"}
              </td>

              <td className="p-3 space-x-2">

                <button
                  onClick={() => setEditingUser(u)}
                  className="bg-yellow-400 px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleUser(u.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  {u.is_active ? "Block" : "Unblock"}
                </button>

                <button
                  onClick={() => openDeleteModal(u.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DELETE MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow w-80 text-center">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>

            <p className="mb-4">Are you sure?</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-80">

            <h3 className="text-xl font-bold mb-4">Edit User</h3>

            <input
              className="border p-2 w-full mb-2"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  name: e.target.value,
                })
              }
            />

            <input
              className="border p-2 w-full mb-4"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  email: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={updateUser}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default User;