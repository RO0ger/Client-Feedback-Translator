import React from 'react';

const Card = ({ title, children, imageUrl }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg border border-gray-200">
      {imageUrl && <img className="w-full" src={imageUrl} alt={title} />}
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">
          {children}
        </p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
      </div>
    </div>
  );
};

export default Card;
