"use client";
import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import api from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import CampaignCarousel from "@/components/CampaignCarousel";
import FilterSortBar from "@/components/FilterSortBar";

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all products once for categories and carousel
        const allResponse = await api.get("/products");
        setAllProducts(allResponse.data);
        setCategories(
          [...new Set(allResponse.data.map((p) => p.category))].filter(Boolean)
        );

        // Initial filtered products
        fetchFilteredProducts(allResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    // Filter/Sort locally after initial load
    if (allProducts.length > 0) {
      fetchFilteredProducts(allProducts);
    }
  }, [searchQuery, sortOption, filterCategory]);

  const fetchFilteredProducts = (products) => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Apply sorting
    if (sortOption) {
      const [sortField, sortOrder] = sortOption.split("_");
      filtered.sort((a, b) => {
        if (sortOrder === "asc") return a[sortField] - b[sortField];
        return b[sortField] - a[sortField];
      });
    }

    setFilteredProducts(filtered);
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error)
    return <div className="text-center py-5 text-danger">Error: {error}</div>;

  return (
    <main className="py-4">
      <CampaignCarousel allProducts={allProducts} />

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
        {filteredProducts.map((product) => (
          <Col key={product.id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </main>
  );
}
