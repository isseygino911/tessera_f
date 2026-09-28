function stockLabel(stock) {
  if (stock === 0) return 'Sold out';
  if (stock <= 5) return 'Low';
  return stock;
}

export { stockLabel };
