function sortProducts(products, sort) {
  if (sort === "price-asc") return [...products].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return [...products].sort((a, b) => b.price - a.price);
  if (sort === "name-asc") return [...products].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc") return [...products].sort((a, b) => b.name.localeCompare(a.name));
  return products;
}

export const defaultFilters = {
  search: "",
  category: "All",
  maxPrice: "",
  sort: "default"
};

export function applyFilters(products, filters) {
  const search = filters.search.trim().toLowerCase();
  const maxPrice = Number(filters.maxPrice);

  const filtered = products.filter((product) => {
    const matchesSearch = search ? product.name.toLowerCase().includes(search) : true;
    const matchesCategory = filters.category !== "All" ? product.category === filters.category : true;
    const matchesPrice = Number.isFinite(maxPrice) && maxPrice > 0 ? product.price <= maxPrice : true;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return sortProducts(filtered, filters.sort);
}
