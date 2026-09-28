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
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          <th>Placed</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{orderNumber(order.id)}</td>
            <td>{order.customerName}</td>
            <td>{order.itemCount}</td>
            <td>{formatPrice(order.totalCents)}</td>
            <td>
              <span className={`status-pill status-pill--${order.status}`}>{order.status}</span>
            </td>
            <td>{formatDate(order.createdAt)}</td>
            <td>
              <Link to={`/admin/orders/${order.id}`} className="btn-link">
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
