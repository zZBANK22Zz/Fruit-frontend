import { useRouter } from "next/router";

const Card = ({ image, name, price, farmDirect = true, productId }) => {
  const router = useRouter();

  const handleClick = () => {
    if (productId) {
      router.push(`/products/SelectedPage?id=${productId}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
    >
      {/* Product Image */}
      <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 relative">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          onError={(e) => {
            console.error('Image failed to load:', image);
            e.target.src = '/images/example.jpg'; // Fallback image
          }}
        />
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 bg-white">
        {/* Product Name */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xs text-gray-500">กิโลกรัมละ</span>
          <p className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          ${price}
        </p>
          <span className="text-xs text-gray-500">บาท</span>
        </div>

        {/* Farm Direct Badge */}
        {farmDirect && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full">
            <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-medium text-orange-700">
            ส่งตรงจากสวน
          </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;

