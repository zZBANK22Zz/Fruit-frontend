import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "../../utils/LanguageContext";
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
  TrashIcon,
  ArchiveBoxIcon,
  TagIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";

export default function AdminProductsPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
    image: null,
    selling_options: [],
    unitOption: "",
    estimated_weight_kg: ""
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
          notifyError(t('noAccessTitle') || 'ไม่มีสิทธิ์เข้าถึง', t('noAccessMessage') || 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
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
                notifyError(t('noAccessTitle') || 'ไม่มีสิทธิ์เข้าถึง', t('noAccessMessage') || 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
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
      setError(t('enterCategoryName') || 'กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError(t('loginDataNotFound') || 'ไม่พบข้อมูลการเข้าสู่ระบบ');
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
        throw new Error(data.message || t('cannotCreateCategory') || 'ไม่สามารถสร้างหมวดหมู่ได้');
      }

      setSuccess(t('createCategorySuccessTitle') || 'สร้างหมวดหมู่สำเร็จ');
      notifySuccess(t('createCategorySuccessTitle') || 'สร้างหมวดหมู่สำเร็จ', t('createCategorySuccessMessage', newCategoryName) || `หมวดหมู่ "${newCategoryName}" ถูกสร้างเรียบร้อยแล้ว`);
      setNewCategoryName("");
      setShowCategoryModal(false);
      loadCategories(); // Reload categories
    } catch (err) {
      setError(err.message || t('errorCreatingCategory') || 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่');
      notifyError(t('createCategoryFailedTitle') || 'สร้างหมวดหมู่ไม่สำเร็จ', err.message || t('errorCreatingCategory') || 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่');
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
        setError(t('errorProcessingImage') || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองอีกครั้ง');
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
      setError(t('enterProductNameAndPrice') || 'กรุณากรอกชื่อสินค้าและราคา');
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError(t('loginDataNotFound') || 'ไม่พบข้อมูลการเข้าสู่ระบบ');
        setIsSubmitting(false);
        return;
      }

      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: parseFloat(productForm.price),
        stock: parseFloat(productForm.stock) || 0, // Stock in kilograms (can be decimal)
        category_id: productForm.category_id || null,
        estimated_weight_kg: productForm.estimated_weight_kg ? parseFloat(productForm.estimated_weight_kg) : null,
        image: productForm.image || null,
        selling_options: productForm.unitOption 
            ? [{
                label: `ขายเป็น${productForm.unitOption}`,
                unit: productForm.unitOption,
                price: parseFloat(productForm.price) || 0
              }]
            : null
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
        throw new Error(data.message || t('cannotCreateProduct') || 'ไม่สามารถสร้างสินค้าได้');
      }

      setSuccess(t('createProductSuccessTitle') || 'สร้างสินค้าสำเร็จ');
      notifySuccess(t('createProductSuccessTitle') || 'สร้างสินค้าสำเร็จ', t('createProductSuccessMessage', productForm.name) || `สินค้า "${productForm.name}" ถูกสร้างเรียบร้อยแล้ว`);
      
      // Reset form
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
        image: null,
        selling_options: [],
        unitOption: "",
        estimated_weight_kg: ""
      });
      setImagePreview(null);
      setShowProductModal(false);
      await loadProducts(); // Reload products
    } catch (err) {
      setError(err.message || t('errorCreatingProduct') || 'เกิดข้อผิดพลาดในการสร้างสินค้า');
      notifyError(t('createProductFailedTitle') || 'สร้างสินค้าไม่สำเร็จ', err.message || t('errorCreatingProduct') || 'เกิดข้อผิดพลาดในการสร้างสินค้า');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);

    // Parse selling_options if it's a string (from DB)
    let parsedOptions = [];
    if (product.selling_options) {
      if (typeof product.selling_options === 'string') {
        try { parsedOptions = JSON.parse(product.selling_options); } catch (e) { console.error('Error parsing selling_options:', e); }
      } else if (Array.isArray(product.selling_options)) {
        parsedOptions = product.selling_options;
      }
    }
    
    // Extract the unitOption if it exists (for backward compatibility with the new flow)
    let unitOption = "";
    if (parsedOptions.length > 0 && parsedOptions[0].unit) {
        unitOption = parsedOptions[0].unit;
    }

    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      category_id: product.category_id?.toString() || "",
      image: product.image || null,
      selling_options: parsedOptions,
      unitOption: unitOption,
      estimated_weight_kg: product.estimated_weight_kg?.toString() || ""
    });
    setImagePreview(product.image ? `data:image/jpeg;base64,${product.image}` : null);
    setShowEditModal(true);
    setError("");
    setSuccess("");
  };

  const handleUpdateProduct = async () => {
    if (!productForm.name || !productForm.price) {
      setError(t('enterProductNameAndPrice') || 'กรุณากรอกชื่อสินค้าและราคา');
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError(t('loginDataNotFound') || 'ไม่พบข้อมูลการเข้าสู่ระบบ');
        setIsSubmitting(false);
        return;
      }

      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: parseFloat(productForm.price),
        stock: parseFloat(productForm.stock) || 0, // Stock in kilograms (can be decimal)
        category_id: productForm.category_id || null,
        estimated_weight_kg: productForm.estimated_weight_kg ? parseFloat(productForm.estimated_weight_kg) : null,
        image: productForm.image || null,
        selling_options: productForm.unitOption 
            ? [{
                label: `ขายเป็น${productForm.unitOption}`,
                unit: productForm.unitOption,
                price: parseFloat(productForm.price) || 0
              }]
            : null
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
        throw new Error(data.message || t('cannotUpdateProduct') || 'ไม่สามารถอัปเดตสินค้าได้');
      }

      setSuccess(t('updateProductSuccessTitle') || 'อัปเดตสินค้าสำเร็จ');
      notifySuccess(t('updateProductSuccessTitle') || 'อัปเดตสินค้าสำเร็จ', t('updateProductSuccessMessage', productForm.name) || `สินค้า "${productForm.name}" ถูกอัปเดตเรียบร้อยแล้ว`);
      
      // Reset form
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
        image: null,
        selling_options: [],
        unitOption: "",
        estimated_weight_kg: ""
      });
      setImagePreview(null);
      setEditingProduct(null);
      setShowEditModal(false);
      await loadProducts(); // Reload products
    } catch (err) {
      setError(err.message || t('errorUpdatingProduct') || 'เกิดข้อผิดพลาดในการอัปเดตสินค้า');
      notifyError(t('updateProductFailedTitle') || 'อัปเดตสินค้าไม่สำเร็จ', err.message || t('errorUpdatingProduct') || 'เกิดข้อผิดพลาดในการอัปเดตสินค้า');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(t('confirmDeleteProduct', productName) || `คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${productName}"?`)) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError(t('loginDataNotFound') || 'ไม่พบข้อมูลการเข้าสู่ระบบ');
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
        throw new Error(data.message || t('cannotDeleteProduct') || 'ไม่สามารถลบสินค้าได้');
      }

      notifySuccess(t('deleteProductSuccessTitle') || 'ลบสินค้าสำเร็จ', t('deleteProductSuccessMessage', productName) || `สินค้า "${productName}" ถูกลบเรียบร้อยแล้ว`);
      await loadProducts(); // Reload products
    } catch (err) {
      setError(err.message || t('errorDeletingProduct') || 'เกิดข้อผิดพลาดในการลบสินค้า');
      notifyError(t('deleteProductFailedTitle') || 'ลบสินค้าไม่สำเร็จ', err.message || t('errorDeletingProduct') || 'เกิดข้อผิดพลาดในการลบสินค้า');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBananaSelected = () => {
    const categoryIdStr = productForm.category_id?.toString();
    const category = categories.find(c => c.id.toString() === categoryIdStr);
    const categoryName = category ? category.name.toLowerCase() : "";
    const name = (productForm.name || "").toLowerCase();
    
    return name.includes("กล้วย") || name.includes("banana") || categoryName.includes("กล้วย") || categoryName.includes("banana");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
            <p className="text-gray-500 font-medium">{t('loadingOrderData') || 'กำลังโหลดข้อมูลออเดอร์...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-900 relative">
        {/* Background decorations */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-100/40 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/40 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <Navbar showBackButton={true} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                   <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-3">
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">{t('manageStockTitlePart1') || 'จัดการ'}</span> {t('manageStockTitlePart2') || 'สต็อกสินค้า'}
                   </h1>
                   <p className="text-lg text-gray-500 font-medium max-w-xl">
                       {t('manageStockDesc') || 'จัดการผลไม้สด อัปเดตสต็อก และจัดหมวดหมู่สินค้า ทั้งหมดในที่เดียว'}
                   </p>
                </div>
                <div className="flex flex-wrap gap-4">
                    {/* Add Category Button */}
                     <button
                        onClick={() => { setShowCategoryModal(true); setError(""); setSuccess(""); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-green-100 text-green-700 rounded-2xl hover:bg-green-50 hover:border-green-300 hover:-translate-y-1 transition-all duration-300 font-bold shadow-sm hover:shadow-md"
                     >
                        <TagIcon className="w-5 h-5" />
                        <span>{t('addCategoryBtn') || 'เพิ่มหมวดหมู่'}</span>
                     </button>
                    {/* Add Product Button */}
                    <button
                        onClick={() => { setShowProductModal(true); setError(""); setSuccess(""); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-300 font-bold shadow-md"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>{t('addProductBtn') || 'เพิ่มสินค้า'}</span>
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Sidebar / Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FunnelIcon className="w-5 h-5 text-orange-500" />
                            {t('filterTitle') || 'ตัวกรอง'}
                        </h3>
                        
                        {/* Search */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t('searchLabel') || 'ค้นหา'}</label>
                            <div className="relative group">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('searchProductPlaceholder') || "ค้นหาชื่อสินค้า..."}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all duration-300 font-medium text-gray-700 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t('categoryLabel') || 'หมวดหมู่'}</label>
                             <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategoryFilter("")}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-between ${
                                        selectedCategoryFilter === "" 
                                        ? "bg-orange-50 text-orange-700 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <span>{t('allProductsLabel') || 'สินค้าทั้งหมด'}</span>
                                    {selectedCategoryFilter === "" && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                                </button>
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategoryFilter(category.id.toString())}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-between ${
                                            selectedCategoryFilter === category.id.toString()
                                            ? "bg-orange-50 text-orange-700 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span>{category.name}</span>
                                        {selectedCategoryFilter === category.id.toString() && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                                    </button>
                                ))}
                             </div>
                        </div>

                        {/* Summary Stats (Optional - Simple count) */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                             <div className="flex items-center justify-between text-sm">
                                 <span className="text-gray-500 font-medium">{t('totalProductsLabel') || 'สินค้าทั้งหมด'}</span>
                                 <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">{filteredProducts.length}</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Product List */}
                <div className="lg:col-span-3">
                    {/* Header Row (Desktop) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 mb-2 font-bold text-gray-400 text-xs uppercase tracking-wider">
                        <div className="col-span-6 pl-20">{t('productInfoCol') || 'ข้อมูลสินค้า'}</div>
                        <div className="col-span-2 text-right">{t('priceCol') || 'ราคา'}</div>
                        <div className="col-span-2 text-center">{t('stockCol') || 'คงเหลือ'}</div>
                        <div className="col-span-2 text-right">{t('manageCol') || 'จัดการ'}</div>
                    </div>

                    <div className="space-y-4">
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-12 text-center border border-dashed border-gray-300">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                     <MagnifyingGlassIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noProductsFoundTitle') || 'ไม่พบสินค้า'}</h3>
                                <p className="text-gray-500">{t('noProductsFoundDesc') || 'ลองปรับการค้นหาหรือเลือกหมวดหมู่อื่นดูนะครับ'}</p>
                                <button 
                                    onClick={() => {setSearchQuery(""); setSelectedCategoryFilter("");}}
                                    className="mt-6 text-orange-500 font-bold hover:text-orange-600 hover:underline"
                                >
                                    {t('clearAllFiltersBtn') || 'ล้างตัวกรองทั้งหมด'}
                                </button>
                            </div>
                        ) : (
                            filteredProducts.map(product => (
                                <div 
                                    key={product.id} 
                                    className="group relative bg-white/80 backdrop-blur-sm rounded-[1.5rem] p-4 shadow-sm border border-transparent hover:border-orange-200 hover:shadow-lg hover:bg-white hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                                        
                                        {/* Product Info (Image + Name + Desc) */}
                                        <div className="w-full md:col-span-6 flex items-center gap-5">
                                            <div className="relative w-24 h-24 md:w-20 md:h-20 shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
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
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 absolute inset-0 text-gray-300" style={{ display: product.image ? 'none' : 'flex' }}>
                                                    <PhotoIcon className="w-8 h-8" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                                        {product.category_name || t('noCategorySpecified') || 'ไม่ระบุหมวดหมู่'}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate max-w-xs">{product.description || t('noDescription') || 'ไม่มีรายละเอียด'}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="w-full md:col-span-2 flex md:block items-center justify-between md:text-right">
                                            <span className="md:hidden text-sm font-medium text-gray-400">{t('priceCol') || 'ราคา'}</span>
                                            <div className="text-lg font-bold text-gray-900">
                                                ฿{parseFloat(product.price).toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Stock */}
                                        <div className="w-full md:col-span-2 flex md:block items-center justify-between md:text-center">
                                            <span className="md:hidden text-sm font-medium text-gray-400">{t('stockCol') || 'คงเหลือ'}</span>
                                             <div className="flex flex-col items-end md:items-center">
                                                <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                                                    parseFloat(product.stock) > 10 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : parseFloat(product.stock) > 0 
                                                        ? 'bg-orange-100 text-orange-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    <ArchiveBoxIcon className="w-4 h-4" />
                                                    {parseFloat(product.stock).toFixed(1)} kg
                                                </div>
                                             </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="w-full md:col-span-2 flex justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all hover:scale-110 active:scale-95"
                                                title={t('editBtnTitle') || "Edit"}
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                                className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all hover:scale-110 active:scale-95"
                                                title={t('deleteBtnTitle') || "Delete"}
                                                disabled={isSubmitting}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

      {/* Category Modal - Modernized */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 transform hover:scale-[1.01] transition-all duration-300 border border-white/20 animate-fade-in relative overflow-hidden">
            {/* Modal Background Deco */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t('addNewCategoryTitle') || 'เพิ่มหมวดหมู่ใหม่'}</h3>
                <p className="text-gray-500 text-sm mt-1">{t('addNewCategoryDesc') || 'จัดระเบียบสินค้าของคุณให้ดียิ่งขึ้น'}</p>
              </div>
              <button
                onClick={() => { setShowCategoryModal(false); setNewCategoryName(""); setError(""); setSuccess(""); }}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {t('categoryNameLabel') || 'ชื่อหมวดหมู่'}
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t('categoryNamePlaceholder') || "เช่น ผลไม้เมืองร้อน..."}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium text-lg placeholder-gray-400"
                  disabled={isSubmitting}
                  onKeyPress={(e) => { if (e.key === 'Enter' && !isSubmitting) handleCreateCategory(); }}
                  autoFocus
                />
              </div>

              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>{error}</div>}
              {success && <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-medium border border-green-100 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>{success}</div>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateCategory}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><TagIcon className="w-5 h-5" /> {t('createBtn') || 'สร้างเลย'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal - Modernized */}
      {(showProductModal || (showEditModal && editingProduct)) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-8 my-8 border border-white/20 animate-fade-in relative overflow-hidden">
            {/* Modal Background Deco */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${showEditModal ? 'from-orange-400 to-red-500' : 'from-green-400 to-emerald-500'}`}></div>

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                    {showEditModal ? (t('editProductTitle') || 'แก้ไขสินค้า') : (t('addProductTitle') || 'เพิ่มสินค้าใหม่')}
                </h3>
                <p className="text-gray-500 mt-1">
                    {showEditModal ? (t('editProductDesc') || 'อัปเดตรายละเอียดและสต็อกสินค้า') : (t('addProductDesc') || 'เพิ่มผลไม้สดใหม่ลงในสต็อกของคุณ')}
                </p>
              </div>
              <button
                onClick={() => {
                  if (showEditModal) {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  } else {
                    setShowProductModal(false);
                  }
                  setProductForm({ name: "", description: "", price: "", stock: "", category_id: "", image: null, selling_options: [], unitOption: "", estimated_weight_kg: "" });
                  setImagePreview(null);
                  setError("");
                  setSuccess("");
                }}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
               <div className="space-y-8">
                   
                   {/* Image Section - Prominent */}
                   <div className="flex justify-center">
                        <div className="relative group">
                            <div className={`w-40 h-40 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50 flex items-center justify-center transition-all ${!imagePreview ? 'border-dashed border-gray-300' : ''}`}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <PhotoIcon className="w-12 h-12 text-gray-300" />
                                )}
                                
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                                    <PhotoIcon className="w-8 h-8 mb-1" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{t('changeImage') || 'เปลี่ยนรูปภาพ'}</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} />
                                </label>
                            </div>
                            {imagePreview && (
                                <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-transform hover:scale-110">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Name */}
                       <div className="md:col-span-2">
                           <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('productNameLabel') || 'ชื่อสินค้า'} <span className="text-red-500">*</span></label>
                           <input
                               type="text"
                               value={productForm.name}
                               onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                               placeholder={t('productNamePlaceholder') || "เช่น แอปเปิ้ลฮันนี่คริสป์"}
                               className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all font-medium text-lg placeholder-gray-400"
                               disabled={isSubmitting}
                           />
                       </div>

                       {/* Category */}
                       <div className="md:col-span-2">
                           <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('categoryLabel') || 'หมวดหมู่'}</label>
                           <div className="relative">
                               <TagIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                               <select
                                   value={productForm.category_id}
                                   onChange={(e) => setProductForm(prev => ({ ...prev, category_id: e.target.value }))}
                                   className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all font-medium text-gray-700 appearance-none"
                                   disabled={isSubmitting}
                               >
                                   <option value="">{t('selectCategoryPlaceholder') || 'เลือกหมวดหมู่'}</option>
                                   {categories.map((category) => (
                                       <option key={category.id} value={category.id}>{category.name}</option>
                                   ))}
                               </select>
                               <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                   <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
                               </div>
                           </div>
                       </div>

                       {/* Banana Unit Option (Conditional) */}
                       {isBananaSelected() && (
                           <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-100 rounded-2xl animate-fade-in flex flex-col sm:flex-row gap-4 items-center justify-between">
                               <div>
                                   <label className="block text-sm font-bold text-orange-800 mb-1 uppercase tracking-wide">{t('sellingFormatForBanana') || 'รูปแบบการขาย (สำหรับกล้วย)'}</label>
                                   <p className="text-xs text-orange-600">{t('selectSellingUnitDesc') || 'เลือกหน่วยการขายเพื่อให้ลูกค้าเลือกซื้อได้ถูกต้อง'}</p>
                               </div>
                               <div className="w-full sm:w-64">
                                   <div className="relative">
                                       <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                                       <select
                                           value={productForm.unitOption || ""}
                                           onChange={(e) => setProductForm(prev => ({ ...prev, unitOption: e.target.value }))}
                                           className="w-full pl-11 pr-5 py-3 bg-white border-2 border-orange-200 focus:bg-white focus:border-orange-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all font-bold text-orange-800 appearance-none shadow-sm cursor-pointer"
                                           disabled={isSubmitting}
                                       >
                                           <option value="">{t('selectUnitPlaceholder') || 'เลือกหน่วย...'}</option>
                                           <option value="หวี">{t('sellByBunch') || 'ขายเป็น "หวี"'}</option>
                                           <option value="ลูก">{t('sellByPiece') || 'ขายเป็น "ลูก"'}</option>
                                       </select>
                                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                           <ArrowsUpDownIcon className="w-4 h-4 text-orange-400" />
                                       </div>
                                   </div>
                               </div>
                           </div>
                       )}

                       {/* Price */}
                       <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                              {isBananaSelected() && productForm.unitOption 
                                   ? (t('pricePerUnitLabel', productForm.unitOption) || `ราคา (บาท / ${productForm.unitOption}) `) 
                                   : (t('priceBahtLabel') || 'ราคา (บาท) ')}
                              <span className="text-red-500">*</span>
                           </label>
                           <input
                               type="number"
                               value={productForm.price}
                               onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                               placeholder="0.00"
                               min="0"
                               step="0.01"
                               className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all font-medium text-lg placeholder-gray-400"
                               disabled={isSubmitting}
                           />
                       </div>

                       {/* Stock */}
                       <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                              {isBananaSelected() && productForm.unitOption 
                                   ? (t('amountUnitLabel', productForm.unitOption) || `จำนวน (${productForm.unitOption})`) 
                                   : (t('stockKgLabel') || 'สต็อก (กก.)')}
                           </label>
                           <input
                               type="number"
                               value={productForm.stock}
                               onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                               placeholder="0"
                               min="0"
                               className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all font-medium text-lg placeholder-gray-400"
                               disabled={isSubmitting}
                           />
                       </div>

                       {/* Estimated Weight Option */}
                       <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                               {t('estimatedWeightLabel') || 'น้ำหนักโดยประมาณ (กก./ชิ้น)'}
                           </label>
                           <input
                               type="number"
                               value={productForm.estimated_weight_kg || ''}
                               onChange={(e) => setProductForm(prev => ({ ...prev, estimated_weight_kg: e.target.value }))}
                               placeholder={t('estimatedWeightPlaceholder') || "เช่น 1.5"}
                               min="0"
                               step="0.01"
                               className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all font-medium text-lg placeholder-gray-400"
                               disabled={isSubmitting}
                           />
                       </div>

                       {/* Description */}
                       <div className="md:col-span-2">
                           <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('descriptionLabel') || 'รายละเอียด'}</label>
                           <textarea
                               value={productForm.description}
                               onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                               placeholder={t('descriptionPlaceholder') || "บรรยายรสชาติ, ที่มา, สายพันธุ์..."}
                               rows={3}
                               className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all font-medium text-base placeholder-gray-400 resize-none"
                               disabled={isSubmitting}
                           />
                       </div>
                   </div>

                   {/* Status Messages */}
                   {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-shake"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>{error}</div>}
                   {success && <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-medium border border-green-100 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>{success}</div>}

                   {/* Actions */}
                   <div className="flex gap-4 pt-4">
                       <button
                           onClick={() => {
                               if (showEditModal) handleUpdateProduct();
                               else handleCreateProduct();
                           }}
                           disabled={isSubmitting}
                           className={`flex-1 py-4 text-white rounded-2xl font-bold text-lg hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 ${
                               showEditModal 
                               ? 'bg-orange-500 hover:bg-orange-600 hover:shadow-orange-200' 
                               : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200'
                           }`}
                       >
                           {isSubmitting ? (
                               <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           ) : (
                               <>
                                {showEditModal ? <PencilIcon className="w-5 h-5"/> : <PlusIcon className="w-5 h-5"/>}
                                {showEditModal ? (t('updateProductBtn') || 'อัปเดตสินค้า') : (t('addProductBtn') || 'เพิ่มสินค้า')}
                               </>
                           )}
                       </button>
                   </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
