"use client";

import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Loading";
import { ServiceCard } from "@/components/ServiceCard";
import { api } from "@/lib/api-client";
import type { ApiMeta, Category, Service } from "@/lib/types";
import { Compass, Filter, GraduationCap, RotateCcw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const emptyMeta: ApiMeta = { page: 1, limit: 9, total: 0, totalPages: 1 };

export function ServicesPageClient() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ApiMeta>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") ?? "",
    categoryId: searchParams.get("categoryId") ?? "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: "1"
  });

  const load = useCallback(async (next = filters) => {
    setLoading(true);
    const query = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    query.set("limit", "9");

    try {
      const response = await api.get<Service[]>(`/services?${query}`);
      setServices(response.data);
      setMeta(response.meta ?? emptyMeta);
    } catch {
      setServices([]);
      setMeta(emptyMeta);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void api.get<Category[]>("/categories")
      .then((response) => setCategories(response.data))
      .catch(() => setCategories([]));
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const next = { ...filters, page: "1" };
    setFilters(next);
    void load(next);
  }

  function handleReset() {
    const next = {
      search: "",
      categoryId: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: "1"
    };
    setFilters(next);
    void load(next);
  }

  function handlePageChange(newPage: number) {
    const next = { ...filters, page: String(newPage) };
    setFilters(next);
    void load(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow muted-eyebrow">
              <Sparkles size={16} /> AI-Curated Database
            </span>
            <h1>Find Your Perfect Degree & Consultation</h1>
            <p>
              Explore top global university programs, admission packages, and certified education consultant advisory sessions.
            </p>
          </div>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setFiltersOpen((value) => !value)}
          >
            <SlidersHorizontal size={17} />
            {filtersOpen ? "Hide filters" : "Filter programs"}
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="filter-bar">
          <form className="filter-search-form" onSubmit={handleSearchSubmit}>
            <div className="filter-search-input">
              <Search size={18} />
              <input
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Search courses, universities, or countries (e.g. Master's in UK)..."
                maxLength={100}
              />
            </div>
            <button type="submit" className="button button-primary button-small">
              Search
            </button>
          </form>

          <div className="filter-options">
            <select
              className="filter-select"
              value={filters.categoryId}
              onChange={(event) => {
                const next = { ...filters, categoryId: event.target.value, page: "1" };
                setFilters(next);
                void load(next);
              }}
            >
              <option value="">All Academic Disciplines</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split("-");
                const next = { ...filters, sortBy, sortOrder, page: "1" };
                setFilters(next);
                void load(next);
              }}
            >
              <option value="createdAt-desc">Newest Programs</option>
              <option value="price-asc">Fee: Low to High</option>
              <option value="price-desc">Fee: High to Low</option>
              <option value="rating-desc">Top Rated Advisors</option>
            </select>

            {(filters.search || filters.categoryId || filters.location || filters.minPrice || filters.maxPrice || filters.minRating) && (
              <button type="button" className="button button-ghost button-small" onClick={handleReset}>
                <RotateCcw size={15} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {filtersOpen && (
          <div className="filter-drawer">
            <div className="filter-group">
              <label>Target Destination / Country</label>
              <input
                value={filters.location}
                onChange={(event) => setFilters({ ...filters, location: event.target.value })}
                placeholder="e.g. UK, USA, Australia, Canada"
              />
            </div>

            <div className="filter-group">
              <label>Min Package Fee ($)</label>
              <input
                type="number"
                min={0}
                value={filters.minPrice}
                onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
                placeholder="Min Fee"
              />
            </div>

            <div className="filter-group">
              <label>Max Package Fee ($)</label>
              <input
                type="number"
                min={0}
                value={filters.maxPrice}
                onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
                placeholder="Max Fee"
              />
            </div>

            <div className="filter-group">
              <label>Min Advisor Rating</label>
              <select
                value={filters.minRating}
                onChange={(event) => setFilters({ ...filters, minRating: event.target.value })}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars (Top Rated)</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="button button-primary button-small"
                onClick={() => {
                  const next = { ...filters, page: "1" };
                  void load(next);
                }}
              >
                <Filter size={15} /> Apply filters
              </button>
            </div>
          </div>
        )}

        {/* Service / Program Grid */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : services.length > 0 ? (
          <>
            <div className="card-grid">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {meta.totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px" }}>
                {Array.from({ length: meta.totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isActive = meta.page === pageNumber;
                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      className={`button button-small ${isActive ? "button-primary" : "button-secondary"}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Compass size={28} />}
            title="No study programs found"
            description="Try changing your search keywords, clearing filters, or exploring all global destinations."
            action={
              <button type="button" className="button button-secondary button-small" onClick={handleReset}>
                Reset search filters
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
