"use client";

import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProductCard from "@/components/ProductCard";
import CampaignCarousel from "@/components/CampaignCarousel";
import FilterSortBar from "@/components/FilterSortBar";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (filterCategory) params.append("category", filterCategory);
        if (sortOption) {
          const [sort, order] = sortOption.split("_");
          params.append("_sort", sort);
          params.append("_order", order || "asc");
        }

        const response = await fetch(
          `http://localhost:3001/products?${params.toString()}`
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        // Extract unique categories from all products
        const allCategories = [...new Set(data.map((p) => p.category))].filter(
          Boolean
        );
        setCategories(allCategories);

        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, sortOption, filterCategory]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error)
    return <div className="text-center py-5 text-danger">Error: {error}</div>;

  return (
    <main className="py-4">
      <CampaignCarousel products={products} />

      <FilterSortBar
        searchQuery={searchQuery}
        sortOption={sortOption}
        filterCategory={filterCategory}
        onSearchChange={setSearchQuery}
        onSortChange={setSortOption}
        onFilterChange={setFilterCategory}
        categories={categories}
      />

      <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 px-3">
        {products.map((product) => (
          <Col key={product.id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </main>
  );
}
