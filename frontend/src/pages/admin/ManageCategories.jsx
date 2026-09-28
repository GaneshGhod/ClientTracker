import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import CategoryForm from '../../components/forms/CategoryForm';
import { adminApi } from '../../services/api';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchCats = () => adminApi.getCategories().then(res => setCategories(res.categories || [])).catch(console.error);
  useEffect(() => { fetchCats(); }, []);

  const handleCreate = async (data) => {
    await adminApi.createCategory(data);
    setModalOpen(false);
    fetchCats();
  };

  const cols = [{ header: 'Name', accessorKey: 'name' }];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
        <button onClick={() => setModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Add Category</button>
      </div>
      <DataTable columns={cols} data={categories} />
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="New Category">
        <CategoryForm onSubmit={handleCreate} />
      </Modal>
    </DashboardLayout>
  );
}