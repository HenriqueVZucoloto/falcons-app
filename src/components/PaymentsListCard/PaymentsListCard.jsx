import React from 'react';
import './PaymentsListCard.css';
import { Clock } from 'phosphor-react';

const PaymentsListCard = ({ type, title, icon, list, onItemClick }) => {

  if (list.length === 0) {
    return null;
  }

  // Define as classes CSS baseado no 'type'
  const cardClasses = `card ${type}-card`;
  const itemClasses = `card ${type}-item`;
  const amountClasses = `${type}-amount`;

  return (
    <div className={cardClasses}>
      <div className='card-header'>
        <div className={`${type}-title`}>
          {icon}
          <strong>{title}</strong>
        </div>
      </div>

      <div className={`${type}-list`}>
        {list.map((item) => (
          <button
            key={item.id}
            className={itemClasses}
            
            onClick={() => onItemClick(item)}
          >
            <div className="item-title">
              <Clock size={20} />
              <span> {item.name} </span>
            </div>
            <div className='item-info'>
              <span className='due-date'>{item.dueDate}</span>
              <span className={amountClasses}>R$ {item.amount}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentsListCard;