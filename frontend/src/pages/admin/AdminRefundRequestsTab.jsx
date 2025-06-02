import { useEffect, useState } from "react";
import axios from "axios";
import { notification } from "antd";

import RefundTable from "../../components/administrator_page/RefundTable.jsx";

const AdminRefundRequestsTab = () => {
  const [loading, setLoading] = useState(true);
  const [refundsData, setRefundsData] = useState([]);

  useEffect(() => {
    const fetchAllRefunds = async () => {
      try {
        // Bước 1: Lấy tất cả yêu cầu hoàn tiền
        const response = await axios.get("http://localhost:8000/refund-tickets");
        setRefundsData(response.data);
        console.log("Refunds data:", response.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu hoàn tiền:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRefunds();
  }, []);

  const onResolve = async (record) => {
    try {
      // Update the refund ticket status to "resolved"
      const response = await axios.put(`http://localhost:8000/refund-tickets/${record.id}`, {
        status: "resolved",
        resolved_at: new Date().toISOString()
      });
      
      if (response.status === 200) {
        // Update the local state
        setRefundsData(prevData => 
          prevData.map(ticket => 
            ticket.id === record.id ? {...ticket, status: "resolved", resolved_at: new Date().toISOString()} : ticket
          )
        );
        
        // Show success message
        notification.success({
          message: "Refund Request Resolved",
          description: `Refund request for order ${record.order_id} has been resolved.`,
        });

        // Refresh the refund data to ensure UI displays the latest information
        const refreshResponse = await axios.get("http://localhost:8000/refund-tickets");
        setRefundsData(refreshResponse.data);
      }
    } catch (error) {
      console.error("Error resolving refund request:", error);
      notification.error({
        message: "Failed to Resolve Refund Request",
        description: "Please try again later.",
      });
    }
  };

  return (
    <div style={{ paddingTop: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Refund Requests</h2>
      {loading && <p>Loading...</p>}

      {!loading && refundsData.length === 0 && (
        <p>No refund requests found.</p>
      )}

      {!loading && refundsData.length > 0 && (
        <RefundTable
          data={refundsData}
          onResolve={onResolve}
        />
      )}      
    </div>
  );
};

export default AdminRefundRequestsTab;