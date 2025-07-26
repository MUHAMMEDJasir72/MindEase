import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Table, Button, message, Tabs, Modal } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { clientWithdrawalRequests, processClientWithdraw, processTherapistWithdraw, therapistWithdrawalRequests } from '../../api/admin';
import { showToast } from '../../utils/toast';

function WithdrawalRequests() {
  const [clientRequests, setClientRequests] = useState([]);
  const [therapistRequests, setTherapistRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [isClientRequest, setIsClientRequest] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      const clientRes = await clientWithdrawalRequests();
      setClientRequests(clientRes.data);
      
      const therapistRes = await therapistWithdrawalRequests();
      setTherapistRequests(therapistRes.data);
    } catch (error) {
      message.error('Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmationModal = (id, isClient) => {
    setProcessingId(id);
    setIsClientRequest(isClient);
    setIsModalVisible(true);
  };

  const handleProcess = async () => {
    setIsModalVisible(false);
    try {
      setLoading(true);
      let res;
      if (isClientRequest) {
        res = await processClientWithdraw(processingId);
      } else {
        res = await processTherapistWithdraw(processingId);
      }
      
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        message.error(res.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      message.error('Failed to process withdrawal');
    } finally {
      setLoading(false);
      fetchWithdrawalRequests();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setProcessingId(null);
    setIsClientRequest(false);
  };

  const clientColumns = [
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (client) => client.username,
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'UPI ID',
      dataIndex: 'upi_id',
      key: 'upi_id',
    },
    {
      title: 'Request Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Status',
      dataIndex: 'is_processed',
      key: 'status',
      render: (processed) => (
        <span style={{ color: processed ? 'green' : 'orange' }}>
          {processed ? 'Processed' : 'Pending'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        !record.is_processed && (
          <Button 
            type="primary" 
            onClick={() => showConfirmationModal(record.id, true)}
            loading={loading}
          >
            Process
          </Button>
        )
      ),
    },
  ];

  const therapistColumns = [
    {
      title: 'Therapist',
      dataIndex: 'therapist',
      key: 'therapist',
      render: (therapist) => therapist.username,
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'UPI ID',
      dataIndex: 'upi_id',
      key: 'upi_id',
    },
    {
      title: 'Request Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Status',
      dataIndex: 'is_processed',
      key: 'status',
      render: (processed) => (
        <span style={{ color: processed ? 'green' : 'orange' }}>
          {processed ? 'Processed' : 'Pending'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        !record.is_processed && (
          <Button 
            type="primary" 
            onClick={() => showConfirmationModal(record.id, false)}
            loading={loading}
          >
            Process
          </Button>
        )
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: 'Client Requests',
      children: (
        <Table 
          columns={clientColumns} 
          dataSource={clientRequests} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: '2',
      label: 'Therapist Requests',
      children: (
        <Table 
          columns={therapistColumns} 
          dataSource={therapistRequests} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-[220px] p-6">
        <h1 className="text-2xl font-bold mb-6">Withdrawal Requests</h1>
        
        <Tabs 
          defaultActiveKey="1"
          items={tabItems}
        />

        <Modal
          title="Confirm Processing"
          visible={isModalVisible}
          onOk={handleProcess}
          onCancel={handleCancel}
          okText="Yes, Process"
          cancelText="Cancel"
        >
          <p>Are you sure you want to process this withdrawal request?</p>
          <p>This action cannot be undone.</p>
        </Modal>
      </div>
    </div>
  );
}

export default WithdrawalRequests;