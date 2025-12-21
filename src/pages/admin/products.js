import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { compressImage, validateImageFile } from "../../utils/imageUtils";
import { notifySuccess, notifyError } from "../../utils/notificationUtils";
import { 
  PlusIcon, 
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

export default function AdminProductsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkAdminAccess();
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query and category filter
    let filtered = products;

    // Apply category filter
    if (selectedCategoryFilter) {
      filtered = filtered.filter(product => 
        product.category_id?.toString() === selectedCategoryFilter
      );
    }

    // Apply search query filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category_name && product.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategoryFilter, products]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token) {
        router.push('/registration/LoginPage');
        return;
      }

      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
        
        if (user.role !== 'admin') {
          notifyError('ไม่มีสิทธิ์เข้าถึง', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          router.push('/');
          return;
        }
        setLoading(false);
      } else {
        // Fetch user data from API
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        if (apiUrl) {
          const response = await fetch(`${apiUrl}/api/users/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.user) {
              const user = data.data.user;
              setUserData(user);
              localStorage.setItem('user', JSON.stringify(user));
              
              if (user.role !== 'admin') {
                notifyError('ไม่มีสิทธิ์เข้าถึง', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
                router.push('/');
                return;
              }
            }
          }
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/api/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.categories) {
            setCategories(data.data.categories);
          }
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/api/fruits`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.fruits) {
            setProducts(data.data.fruits);
            setFilteredProducts(data.data.fruits);
          }
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ไม่สามารถสร้างหมวดหมู่ได้');
      }

      setSuccess('สร้างหมวดหมู่สำเร็จ');
      notifySuccess('สร้างหมวดหมู่สำเร็จ', `หมวดหมู่ "${newCategoryName}" ถูกสร้างเรียบร้อยแล้ว`);
      setNewCategoryName("");
      setShowCategoryModal(false);
      loadCategories(); // Reload categories
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่');
      notifyError('สร้างหมวดหมู่ไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      try {
        setIsSubmitting(true);
        setError("");
        
        const compressedBase64 = await compressImage(file, 800, 800, 0.8);
        
        setProductForm(prev => ({
          ...prev,
          image: compressedBase64
        }));
        
        setImagePreview(`data:image/jpeg;base64,${compressedBase64}`);
        setError("");
      } catch (err) {
        console.error('Image compression error:', err);
        setError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองอีกครั้ง');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setProductForm(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.price) {
      setError('กรุณากรอกชื่อสินค้าและราคา');
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ');
        setIsSubmitting(false);
        return;
      }

      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: parseFloat(productForm.price),
        stock: parseFloat(productForm.stock) || 0, // Stock in kilograms (can be decimal)
        category_id: productForm.category_id || null,
        image: productForm.image || null
      };

      const response = await fetch(`${apiUrl}/api/fruits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ไม่สามารถสร้างสินค้าได้');
      }

      setSuccess('สร้างสินค้าสำเร็จ');
      notifySuccess('สร้างสินค้าสำเร็จ', `สินค้า "${productForm.name}" ถูกสร้างเรียบร้อยแล้ว`);
      
      // Reset form
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
        image: null
      });
      setImagePreview(null);
      setShowProductModal(false);
      await loadProducts(); // Reload products
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างสินค้า');
      notifyError('สร้างสินค้าไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการสร้างสินค้า');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      category_id: product.category_id?.toString() || "",
      image: product.image || null
    });
    setImagePreview(product.image ? `data:image/jpeg;base64,${product.image}` : null);
    setShowEditModal(true);
    setError("");
    setSuccess("");
  };

  const handleUpdateProduct = async () => {
    if (!productForm.name || !productForm.price) {
      setError('กรุณากรอกชื่อสินค้าและราคา');
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ');
        setIsSubmitting(false);
        return;
      }

      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: parseFloat(productForm.price),
        stock: parseFloat(productForm.stock) || 0, // Stock in kilograms (can be decimal)
        category_id: productForm.category_id || null,
        image: productForm.image || null
      };

      const response = await fetch(`${apiUrl}/api/fruits/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ไม่สามารถอัปเดตสินค้าได้');
      }

      setSuccess('อัปเดตสินค้าสำเร็จ');
      notifySuccess('อัปเดตสินค้าสำเร็จ', `สินค้า "${productForm.name}" ถูกอัปเดตเรียบร้อยแล้ว`);
      
      // Reset form
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
        image: null
      });
      setImagePreview(null);
      setEditingProduct(null);
      setShowEditModal(false);
      await loadProducts(); // Reload products
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสินค้า');
      notifyError('อัปเดตสินค้าไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการอัปเดตสินค้า');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${productName}"?`)) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/fruits/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ไม่สามารถลบสินค้าได้');
      }

      notifySuccess('ลบสินค้าสำเร็จ', `สินค้า "${productName}" ถูกลบเรียบร้อยแล้ว`);
      await loadProducts(); // Reload products
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบสินค้า');
      notifyError('ลบสินค้าไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการลบสินค้า');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20">
      <Navbar showBackButton={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-10 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
              จัดการสินค้าและหมวดหมู่
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Add Category Button */}
            <button
              onClick={() => {
                setShowCategoryModal(true);
                setError("");
                setSuccess("");
              }}
              className="group flex items-center justify-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-6 h-6 text-blue-600 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-lg font-bold text-blue-700">เพิ่มหมวดหมู่</span>
            </button>

            {/* Add Product Button */}
            <button
              onClick={() => {
                setShowProductModal(true);
                setError("");
                setSuccess("");
              }}
              className="group flex items-center justify-center gap-3 p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-6 h-6 text-orange-600 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-lg font-bold text-orange-700">เพิ่มสินค้า</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-2 relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาสินค้า, คำอธิบาย, หรือหมวดหมู่..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative group">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 appearance-none bg-white shadow-sm hover:shadow-md transition-all duration-300 font-medium text-gray-700"
                >
                  <option value="">ทั้งหมดหมวดหมู่</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(selectedCategoryFilter || searchQuery.trim() !== "") && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600">ตัวกรอง:</span>
                {selectedCategoryFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {categories.find(c => c.id.toString() === selectedCategoryFilter)?.name}
                    <button
                      onClick={() => setSelectedCategoryFilter("")}
                      className="hover:text-blue-900"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() !== "" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    ค้นหา: {searchQuery}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-orange-900"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategoryFilter("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="mt-8 overflow-x-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">สินค้าทั้งหมด</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สต็อก</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คำอธิบาย</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      {searchQuery ? 'ไม่พบสินค้าที่ค้นหา' : 'ยังไม่มีสินค้า'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={`data:image/jpeg;base64,${product.image}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center" style={{ display: product.image ? 'none' : 'flex' }}>
                            <PhotoIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.category_name || '-'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{parseFloat(product.price).toFixed(2)} บาท</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`text-sm font-medium ${parseFloat(product.stock) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(product.stock).toFixed(2)} kg
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {product.description || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                            disabled={isSubmitting}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Products Count */}
          <div className="mt-4 text-sm text-gray-500">
            แสดง {filteredProducts.length} จาก {products.length} สินค้า
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 transform hover:scale-105 transition-transform duration-300 border-2 border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                <h3 className="text-xl font-bold text-gray-900">เพิ่มหมวดหมู่ใหม่</h3>
              </div>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                  setError("");
                  setSuccess("");
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อหมวดหมู่
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="เช่น ผลไม้, ผัก, เนื้อสัตว์"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
                disabled={isSubmitting}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    handleCreateCategory();
                  }
                }}
              />
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleCreateCategory}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'กำลังสร้าง...' : 'สร้างหมวดหมู่'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName("");
                    setError("");
                    setSuccess("");
                  }}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">เพิ่มสินค้าใหม่</h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setProductForm({
                    name: "",
                    description: "",
                    price: "",
                    stock: "",
                    category_id: "",
                    image: null
                  });
                  setImagePreview(null);
                  setError("");
                  setSuccess("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="mt-4 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อสินค้า <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="เช่น แอปเปิ้ล, ส้ม, กล้วย"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย
            </label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="รายละเอียดสินค้า"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคา (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนสต็อก
              </label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมวดหมู่
            </label>
            <select
              value={productForm.category_id}
              onChange={(e) => setProductForm(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitting}
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพสินค้า
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากวาง
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (สูงสุด 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleCreateProduct}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'กำลังสร้าง...' : 'สร้างสินค้า'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowProductModal(false);
                setProductForm({
                  name: "",
                  description: "",
                  price: "",
                  stock: "",
                  category_id: "",
                  image: null
                });
                setImagePreview(null);
                setError("");
                setSuccess("");
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              ยกเลิก
            </Button>
          </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 my-8 border-2 border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                <h3 className="text-xl font-bold text-gray-900">แก้ไขสินค้า</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    description: "",
                    price: "",
                    stock: "",
                    category_id: "",
                    image: null
                  });
                  setImagePreview(null);
                  setError("");
                  setSuccess("");
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="mt-4 space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อสินค้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="เช่น แอปเปิ้ล, ส้ม, กล้วย"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="รายละเอียดสินค้า"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ราคา (บาท) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จำนวนสต็อก
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมวดหมู่
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                    disabled={isSubmitting}
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รูปภาพสินค้า
                  </label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        disabled={isSubmitting}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากวาง
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (สูงสุด 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                      />
                    </label>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                {success && (
                  <p className="text-sm text-green-600">{success}</p>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleUpdateProduct}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'กำลังอัปเดต...' : 'อัปเดตสินค้า'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                      setProductForm({
                        name: "",
                        description: "",
                        price: "",
                        stock: "",
                        category_id: "",
                        image: null
                      });
                      setImagePreview(null);
                      setError("");
                      setSuccess("");
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

