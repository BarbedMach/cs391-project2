// components/FilterSortBar.js
"use client";
import { Form, InputGroup, Dropdown } from "react-bootstrap";
import { Funnel, SortDown } from "react-bootstrap-icons";

const FilterSortBar = ({
  searchQuery,
  sortOption,
  filterCategory,
  onSearchChange,
  onSortChange,
  onFilterChange,
  categories,
}) => {
  return (
    <div className="mb-4 px-3 py-2">
      <div className="d-flex flex-column flex-md-row gap-3 mt-1 mb-1">
        {/* Search Input */}
        <InputGroup className="flex-grow-1 border border-primary rounded">
          <Form.Control
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>

        {/* Sort Dropdown */}
        <Dropdown>
          <Dropdown.Toggle variant="outline-primary">
            <SortDown className="me-2" />
            {sortOption === "price_asc"
              ? "Price: Low to High"
              : sortOption === "-price_desc"
              ? "Price: High to Low"
              : sortOption === "-rating"
              ? "Rating: High to Low"
              : "Sort By"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onSortChange("price_asc")}>
              Price: Low to High
            </Dropdown.Item>
            <Dropdown.Item onClick={() => onSortChange("-price_desc")}>
              Price: High to Low
            </Dropdown.Item>
            <Dropdown.Item onClick={() => onSortChange("-rating")}>
              Rating: High to Low
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* Filter Dropdown */}
        <Dropdown>
          <Dropdown.Toggle variant="outline-primary">
            <Funnel className="me-2" />
            {filterCategory || "Filter by Category"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onFilterChange("")}>
              All Categories
            </Dropdown.Item>
            {categories.map((category) => (
              <Dropdown.Item
                key={category}
                onClick={() => onFilterChange(category)}
              >
                {category}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default FilterSortBar;
