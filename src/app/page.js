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
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsResponse, campaignsResponse] = await Promise.all([
          api.get("/products"),
          api.get("/campaigns"),
        ]);
        setAllProducts(productsResponse.data);
        setCampaigns(campaignsResponse.data);
        setCategories(
          [...new Set(productsResponse.data.map((p) => p.category))].filter(
            Boolean
          )
        );
        fetchFilteredProducts(productsResponse.data);
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
  }, [searchQuery, sortOption, filterCategory, campaigns]);

  const fetchFilteredProducts = (products) => {
    let filtered = [...products].map((product) => {
      const applicableCampaign = campaigns.find(
        (c) => c.category.toLowerCase() === product.category?.toLowerCase()
      );

      // Match ProductCard calculation
      const originalPrice =
        product.discountPercentage > 0
          ? (product.price * 100) / (100 - product.discountPercentage)
          : product.price;

      const baseDiscount = product.discountPercentage || 0;
      const campaignDiscount = applicableCampaign?.extraDiscount || 0;
      const totalDiscount = Math.min(baseDiscount + campaignDiscount, 75);

      return {
        ...product,
        calculatedPrice: (originalPrice * (100 - totalDiscount)) / 100,
      };
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Sorting
    if (sortOption) {
      const [sortField, sortOrder] = sortOption.split("_");
      filtered.sort((a, b) => {
        const valueA = sortField === "price" ? a.calculatedPrice : a[sortField];
        const valueB = sortField === "price" ? b.calculatedPrice : b[sortField];

        if (sortOrder === "asc") return valueA - valueB;
        if (sortOrder === "desc") return valueB - valueA;
        return 0;
      });
    }

    setFilteredProducts(
      filtered.map((p) => ({ ...p, calculatedPrice: undefined }))
    );
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error)
    return <div className="text-center py-5 text-danger">Error: {error}</div>;

  return (
    <main className="py-4">
      <CampaignCarousel allProducts={allProducts} campaigns={campaigns} />

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
            <ProductCard product={product} campaigns={campaigns} />
          </Col>
        ))}
      </Row>
    </main>
  );
}
