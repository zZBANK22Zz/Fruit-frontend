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
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      {/* Product Image */}
      <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.error('Image failed to load:', image);
            e.target.src = '/images/example.jpg'; // Fallback image
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5">
        {/* Product Name */}
        <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">
          {name}
        </h3>

        {/* Price */}
        <p className="text-xl sm:text-2xl font-bold text-orange-500 mb-2">
          ${price}
        </p>

        {/* Farm Direct Badge */}
        {farmDirect && (
          <p className="text-xs sm:text-sm text-gray-600">
            ส่งตรงจากสวน
          </p>
        )}
      </div>
    </div>
  );
};

export default Card;

