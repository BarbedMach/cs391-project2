"use client";
import { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Alert } from "react-bootstrap";
import api from "@/utils/api";

export default function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    extraDiscount: "10", // Default discount set to 10
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [campaignsRes, productsRes] = await Promise.all([
          api.get("/campaigns"),
          api.get("/products"),
        ]);

        // Extract unique categories from products
        const allCategories = [
          ...new Set(productsRes.data.map((p) => p.category)),
        ].filter(Boolean);
        setCategories(allCategories);
        setCampaigns(campaignsRes.data);
      } catch (err) {
        setError("Failed to initialize data");
      }
    };

    initializeData();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get("/campaigns");
      setCampaigns(response.data);
    } catch (err) {
      setError("Failed to fetch campaigns");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      category: campaign.category,
      extraDiscount: campaign.extraDiscount.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.extraDiscount) {
      setError("All fields are required");
      return;
    }

    try {
      if (editingCampaign) {
        await api.put(`/campaigns/${editingCampaign.id}`, formData);
      } else {
        await api.post("/campaigns", formData);
      }
      setShowModal(false);
      fetchCampaigns();
      resetForm();
    } catch (err) {
      setError("Failed to save campaign");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) {
      setError("Failed to delete campaign");
    }
  };

  const resetForm = () => {
    setFormData({ title: "", category: "", extraDiscount: "" });
    setEditingCampaign(null);
    setError("");
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-gradient">Manage Campaigns</h1>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="nav-hover-effect"
        >
          Add New Campaign
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover className="border-primary">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Extra Discount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>{campaign.title}</td>
              <td>{campaign.category}</td>
              <td>{campaign.extraDiscount}%</td>
              <td>
                <Button
                  variant="outline-primary"
                  className="me-2 nav-hover-effect"
                  onClick={() => handleEdit(campaign)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  className="nav-hover-effect"
                  onClick={() => handleDelete(campaign.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <Modal.Header closeButton className="border-primary">
          <Modal.Title className="text-gradient">
            {editingCampaign ? "Edit Campaign" : "New Campaign"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Extra Discount (%)</Form.Label>
              <Form.Control
                type="number"
                name="extraDiscount"
                min="1"
                max="100"
                value={formData.extraDiscount}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="nav-hover-effect"
              >
                {editingCampaign ? "Save Changes" : "Create Campaign"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
