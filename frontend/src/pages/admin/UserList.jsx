import React, { useEffect, useState } from "react";
import { AdminAPI } from "../../services/api";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import Swal from "sweetalert2"; // Import thư viện thông báo đẹp
import AdminTaskbar from "./AdminTaskbar"; // Thanh điều hướng

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await AdminAPI.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- HÀM XỬ LÝ KHÓA/MỞ KHÓA VỚI GIAO DIỆN ĐẸP ---
  const handleBlockUser = async (userId, isBlocked, userName) => {
    const action = isBlocked ? "MỞ KHÓA" : "KHÓA";
    const confirmText = isBlocked ? "Người dùng này sẽ được phép đăng nhập trở lại." : "Người dùng này sẽ không thể đăng nhập được nữa.";
    const confirmColor = isBlocked ? "#28a745" : "#d33"; // Xanh nếu mở, Đỏ nếu khóa

    // Hiển thị Popup hỏi xác nhận
    const result = await Swal.fire({
      title: `Bạn muốn ${action} tài khoản ${userName}?`,
      text: confirmText,
      icon: isBlocked ? 'question' : 'warning', // Icon dấu hỏi hoặc cảnh báo
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Đồng ý ${action}`,
      cancelButtonText: 'Hủy bỏ'
    });

    // Nếu người dùng bấm Đồng ý
    if (result.isConfirmed) {
      try {
        if (isBlocked) {
          await AdminAPI.unblockUser(userId);
          Swal.fire(
            'Đã mở khóa!',
            `Tài khoản ${userName} đã hoạt động trở lại.`,
            'success'
          );
        } else {
          await AdminAPI.blockUser(userId);
          Swal.fire(
            'Đã khóa!',
            `Tài khoản ${userName} đã bị vô hiệu hóa.`,
            'success'
          );
        }
        fetchUsers(); // Load lại danh sách để cập nhật trạng thái
      } catch (error) {
        Swal.fire('Lỗi!', error.message || "Không thể cập nhật trạng thái.", 'error');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid px-4 mt-4 mb-5">
      
      {/* Thanh điều hướng Admin */}
      <AdminTaskbar />

      <h2 className="fw-bold text-primary mb-4">
        <i className="fas fa-users-cog me-2"></i>Quản lý Người dùng
      </h2>
      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="ps-4 py-3">Tên người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Điểm thưởng</th>
                  <th>Trạng thái</th>
                  <th className="text-end pe-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className={`rounded-circle text-white d-flex justify-content-center align-items-center fw-bold shadow-sm ${user.isAdmin ? 'bg-danger' : 'bg-primary'}`} style={{width: 40, height: 40, fontSize: '1.2rem'}}>
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                            <div className="fw-bold text-dark">{user.name}</div>
                            <small className="text-muted">ID: {user._id.slice(-6).toUpperCase()}</small>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.isAdmin ? (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Quản trị viên</span>
                      ) : (
                        <span className="badge bg-info bg-opacity-10 text-info border border-info">Khách hàng</span>
                      )}
                    </td>
                    <td className="text-warning fw-bold">
                        {new Intl.NumberFormat('vi-VN').format(user.loyaltyPoints || 0)} 
                        <span className="small text-muted fw-normal ms-1">điểm</span>
                    </td>
                    <td>
                      {user.isBlocked ? (
                        <span className="badge bg-secondary">
                            <i className="fas fa-lock me-1"></i>Đã khóa
                        </span>
                      ) : (
                        <span className="badge bg-success">
                            <i className="fas fa-check-circle me-1"></i>Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      {!user.isAdmin && ( // Không cho phép khóa Admin
                        <button 
                          className={`btn btn-sm fw-bold ${user.isBlocked ? "btn-outline-success" : "btn-outline-danger"}`}
                          onClick={() => handleBlockUser(user._id, user.isBlocked, user.name)}
                          title={user.isBlocked ? "Mở khóa tài khoản này" : "Khóa tài khoản này"}
                          style={{minWidth: "100px"}}
                        >
                          {user.isBlocked ? (
                              <><i className="fas fa-unlock me-2"></i>Mở khóa</>
                          ) : (
                              <><i className="fas fa-lock me-2"></i>Khóa</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-5 text-muted">Chưa có người dùng nào trong hệ thống.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserList;