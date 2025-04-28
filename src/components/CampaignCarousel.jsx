'use client'

import React from 'react';
import { Carousel } from 'react-bootstrap';
import Link from 'next/link';

export default function CampaignCarousel({ campaigns }) {
    return (
        <Carousel className="mb-4">
          {campaigns.map(campaign => (
            <Carousel.Item key={campaign.id}>
              <img
                className="d-block w-100"
                src={campaign.imageUrl}
                alt={campaign.title}
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <Carousel.Caption className="bg-dark bg-opacity-50 rounded">
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>
                <Link href={`/products?campaign=${campaign.id}`} className="btn btn-primary">
                  Shop Now
                </Link>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      );
}