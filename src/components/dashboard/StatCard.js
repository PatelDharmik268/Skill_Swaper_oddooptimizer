import React from 'react';

const StatCard = ({ icon: Icon, bgColor, iconColor, title, value }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`${bgColor} rounded-full p-3`}>
          <Icon className={`${iconColor} w-6 h-6`} />
        </div>
        <div>
          <h3 className="text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
