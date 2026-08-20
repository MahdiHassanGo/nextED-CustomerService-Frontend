"use client";

import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Loading";
import { TechnicianCard } from "@/components/TechnicianCard";
import { api } from "@/lib/api-client";
import type { ApiMeta, Category, TechnicianProfile } from "@/lib/types";
import { Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

const emptyMeta: ApiMeta = { page: 1, limit: 9, total: 0, totalPages: 1 };

export function TechniciansPageClient() {
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ApiMeta>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    skill: "",
    location: "",
    categoryId: "",
    minRating: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "rating",
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
      const response = await api.get<TechnicianProfile[]>(`/technicians?${query}`);
      setTechnicians(response.data);
      setMeta(response.meta ?? emptyMeta);
    } catch {
      setTechnicians([]);
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

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = { ...filters, page: "1" };
    setFilters(next);
    void load(next);
  }

  function reset() {
    const next = {
      search: "",
      skill: "",
      location: "",
      categoryId: "",
      minRating: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "rating",
      sortOrder: "desc",
      page: "1"
    };
    setFilters(next);
    void load(next);
  }

  function changePage(page: number) {
    const next = { ...filters, page: String(page) };
    setFilters(next);
    void load(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page-shell">
      <section className="page-hero compact-page-hero">
        <div className="container">
          <span className="eyebrow light-eyebrow">Skilled and accountable</span>
          <h1>Meet professionals you can trust.</h1>
          <p>
            Compare experience, skills, pricing, service listings, availability, ratings, and verified customer reviews.
          </p>
        </div>
      </section>

      <section className="container listing-layout">
        <aside className={`filter-panel ${filtersOpen ? "is-open" : ""}`}>
          <div className="filter-title">
            <span>
              <SlidersHorizontal size={19} /> Filters
            </span>
            <button
              type="button"
              className="icon-button compact"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
            >
              ×
            </button>
          </div>

          <form onSubmit={submit}>
            <label className="field">
              <span>Search</span>
              <div className="input-icon">
                <Search size={17} />
                <input
                  value={filters.search}
                  onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                  placeholder="Name, bio, or service"
                  maxLength={100}
                />
              </div>
            </label>

            <label className="field">
              <span>Skill</span>
              <input
                value={filters.skill}
                onChange={(event) => setFilters({ ...filters, skill: event.target.value })}
                placeholder="e.g. Plumbing, Wiring"
                maxLength={80}
              />
            </label>

            <label className="field">
              <span>Location</span>
              <input
                value={filters.location}
                onChange={(event) => setFilters({ ...filters, location: event.target.value })}
                placeholder="City or area"
                maxLength={180}
              />
            </label>

            <label className="field">
              <span>Service category</span>
              <select
                value={filters.categoryId}
                onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Minimum rating</span>
              <select
                value={filters.minRating}
                onChange={(event) => setFilters({ ...filters, minRating: event.target.value })}
              >
                <option value="">Any rating</option>
                <option value="4">4.0 and above</option>
                <option value="3">3.0 and above</option>
              </select>
            </label>

            <div className="field-row">
              <label className="field">
                <span>Min hourly</span>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
                  placeholder="৳0"
                />
              </label>
              <label className="field">
                <span>Max hourly</span>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
                  placeholder="Any"
                />
              </label>
            </div>

            <button className="button button-primary button-full" type="submit">
              <Filter size={17} /> Apply filters
            </button>
            <button className="button button-ghost button-full" type="button" onClick={reset}>
              <RotateCcw size={16} /> Reset filters
            </button>
          </form>
        </aside>

        <div className="listing-main">
          <div className="listing-toolbar">
            <div>
              <button
                type="button"
                className="button button-secondary mobile-filter"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal size={17} /> Filters
              </button>
              <span>
                {meta.total} {meta.total === 1 ? "professional" : "professionals"} found
              </span>
            </div>

            <label>
              Sort by
              <select
                value={`${filters.sortBy}:${filters.sortOrder}`}
                onChange={(event) => {
                  const [sortBy, sortOrder] = event.target.value.split(":");
                  const next = { ...filters, sortBy, sortOrder, page: "1" };
                  setFilters(next);
                  void load(next);
                }}
              >
                <option value="rating:desc">Highest rated</option>
                <option value="totalReviews:desc">Most reviewed</option>
                <option value="experienceYears:desc">Most experienced</option>
                <option value="pricePerHour:asc">Hourly rate: low to high</option>
                <option value="createdAt:desc">Newest</option>
              </select>
            </label>
          </div>

          {loading ? (
            <CardSkeleton count={6} />
          ) : technicians.length > 0 ? (
            <div className="technician-grid two-column-grid">
              {technicians.map((technician) => (
                <TechnicianCard technician={technician} key={technician.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No professionals match those filters"
              description="Try another skill, location, price range, or rating."
              action={
                <button type="button" className="button button-secondary" onClick={reset}>
                  Clear filters
                </button>
              }
            />
          )}

          {meta.totalPages > 1 && (
            <nav className="pagination" aria-label="Technician result pages">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => changePage(meta.page - 1)}
              >
                Previous
              </button>
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() => changePage(meta.page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
