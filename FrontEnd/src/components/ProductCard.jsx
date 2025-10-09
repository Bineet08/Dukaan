import React from 'react'

const ProductCard = ({ product }) => {
  const handleAddToCart = () => {
    // Add your cart logic here
    console.log('Added to cart:', product.name)
  }

  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden'>
      <div className='relative'>
        <img 
          src={product.image} 
          alt={product.name}
          className='w-full h-48 object-cover hover:scale-105 transition-transform duration-300'
        />
      </div>
      
      <div className='p-4'>
        <h2 className='text-lg font-semibold text-gray-800 mb-2 line-clamp-2'>
          {product.name}
        </h2>
        
        <div className='flex items-center justify-between mb-3'>
          <p className='text-xl font-bold text-green-600'>
            ₹{product.newPrice}
          </p>
          {product.originalPrice && (
            <p className='text-sm text-gray-500 line-through'>
              ₹{product.originalPrice}
            </p>
          )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          className='w-full bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 active:scale-95 transform'
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default ProductCard