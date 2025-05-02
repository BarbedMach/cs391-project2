"use client";
import React, { useEffect, useState } from "react";
import { Carousel, Badge } from "react-bootstrap";
import api from "@/utils/api";
import ProductCard from "@/components/ProductCard";

const CampaignCarousel = ({ allProducts }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get("/campaigns");
        setCampaigns(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading)
    return <div className="text-center py-3">Loading campaigns...</div>;
  if (error)
    return <div className="text-center py-3 text-danger">Error: {error}</div>;

  return (
    <Carousel
      fade
      indicators={false}
      className="mb-3 border border-primary rounded nav-hover-effect"
      interval={3000}
      style={{ height: "500px" }}
    >
      {campaigns.map((campaign) => {
        const categoryProducts = allProducts.filter(
          (p) => p.category.toLowerCase() === campaign.category.toLowerCase()
        );

        return (
          <Carousel.Item key={campaign.id}>
            <div className="p-4 bg-light rounded">
              <div className="text-center mb-4 rounded">
                <h2 className="text-gradient d-inline-block">
                  {campaign.title}
                </h2>
                <Badge bg="danger" className="ms-3 fs-5">
                  Extra {campaign.extraDiscount}% Off
                </Badge>
              </div>
              <div className="d-flex flex-nowrap overflow-x-auto p-2">
                {categoryProducts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    className="me-4"
                    style={{ minWidth: "300px" }}
                  >
                    <ProductCard
                      product={product}
                      discount={
                        product.discountPercentage + campaign.extraDiscount
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
};

export default CampaignCarousel;
