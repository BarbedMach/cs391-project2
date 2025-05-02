"use client";
import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import api from "@/utils/api";
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
        const params = {
          q: searchQuery,
          category: filterCategory,
          _sort: sortOption?.split("_")[0],
          _order: sortOption?.split("_")[1] || "asc",
        };

        const response = await api.get("/products", { params });
        const allCategories = [
          ...new Set(response.data.map((p) => p.category)),
        ].filter(Boolean);

        setCategories(allCategories);
        setProducts(response.data);
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
