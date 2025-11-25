import React, { useEffect, useState } from "react";
import { AdminAPI } from "../../services/api";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import AdminTaskbar from "./AdminTaskbar";

<AdminTaskbar/>

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState(""); // Lọc theo trạng thái

  // Hàm load danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, status: filterStatus };
      // Backend trả về { orders: [...], totalOrders: ..., totalPages: ... }
      // Lưu ý: Backend cần hỗ trợ filter status nếu chưa có
      const res = await AdminAPI.getOrders(params);
      setOrders(res.orders || []);
      setMeta({ 
          currentPage: res.currentPage, 
          totalPages: res.totalPages,
          totalOrders: res.totalOrders 
      });
    } catch (error) {
      toast.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang "${newStatus}"?`)) return;

    try {
      await AdminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
      fetchOrders(); // Reload lại danh sách
    } catch (error) {
      toast.error(error.message || "Lỗi cập nhật trạng thái");
    }
  };

  // Helper tô màu trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return <span className="badge bg-warning text-dark">Chờ xử lý</span>;
      case "confirmed": return <span className="badge bg-primary">Đã xác nhận</span>;
      case "shipping": return <span className="badge bg-info text-dark">Đang giao</span>;
      case "delivered": return <span className="badge bg-success">Đã giao</span>;
      case "cancelled": return <span className="badge bg-danger">Đã hủy</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Helper format tiền
  const formatMoney = (amount) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  return (
    <div className="container-fluid px-4 mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <AdminTaskbar />
        <h2 className="fw-bold text-primary"><i className="fas fa-clipboard-list me-2"></i>Quản lý Đơn hàng</h2>
        
        {/* Bộ lọc trạng thái */}
        <div className="d-flex align-items-center">
            <label className="me-2 fw-bold">Lọc:</label>
            <select 
                className="form-select form-select-sm" 
                style={{width: '150px'}}
                value={filterStatus}
                onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                }}
            >
                <option value="">Tất cả</option>
                <option value="confirmed">Xác nhận</option>
                <option value="shipping">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
            </select>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th className="text-end pe-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr>
                        <td colSpan="7" className="text-center py-5">
                            <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                            Đang tải dữ liệu...
                        </td>
                    </tr>
                ) : orders.length > 0 ? (
                    orders.map((order) => (
                    <tr key={order._id}>
                        <td className="ps-4 fw-bold text-primary">
                            #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td>
                            <div className="fw-bold">{order.name || "Khách lẻ"}</div>
                            <small className="text-muted">{order.email}</small>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="fw-bold text-danger">
                            {formatMoney(order.totalPrice)}
                        </td>
                        <td>
                            <span className="badge bg-light text-dark border">
                                {order.paymentMethod === 'COD' ? 'Tiền mặt' : 'Chuyển khoản'}
                            </span>
                        </td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td className="text-end pe-4">
                            {/* Dropdown thay đổi trạng thái nhanh */}
                            <div className="btn-group">
                                <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                    Cập nhật
                                </button>
                                <ul className="dropdown-menu">
                                    <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order._id, 'confirmed')}>Xác nhận</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order._id, 'shipping')}>Đang giao</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order._id, 'delivered')}>Đã giao</button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-danger" onClick={() => handleUpdateStatus(order._id, 'cancelled')}>Hủy đơn</button></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                            Không tìm thấy đơn hàng nào.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phân trang */}
        {!loading && meta.totalPages > 1 && (
            <div className="card-footer bg-white py-3">
                <Pagination 
                    currentPage={meta.currentPage} 
                    totalPages={meta.totalPages} 
                    onPageChange={(p) => setPage(p)} 
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;