import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/formatDate.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { orderNumber } from '@/lib/orderNumber.js';

export default function OrdersTable({ orders }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th className="num">Items</th>
          <th className="num">Total</th>
          <th>Status</th>
          <th>Placed</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="admin-order-id">{orderNumber(order.id)}</td>
            <td>{order.customerName}</td>
            <td className="num">{order.itemCount}</td>
            <td className="num">{formatPrice(order.totalCents)}</td>
            <td>
              <span className={`status-pill status-pill--${order.status}`}>{order.status}</span>
            </td>
            <td>{formatDate(order.createdAt)}</td>
            <td>
              <Link to={`/admin/orders/${order.id}`} className="admin-link">
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
