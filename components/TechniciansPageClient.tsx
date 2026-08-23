"use client";

import { EmptyState } from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Loading";
import { TechnicianCard } from "@/components/TechnicianCard";
import { api } from "@/lib/api-client";
import type { ApiMeta, TechnicianProfile } from "@/lib/types";
import { CheckCircle2, RotateCcw, Search, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const emptyMeta: ApiMeta = { page: 1, limit: 9, total: 0, totalPages: 1 };

export function TechniciansPageClient() {
  const searchParams = useSearchParams();
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [meta, setMeta] = useState<ApiMeta>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") ?? "",
    location: "",
    minRating: "",
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
    void load();
  }, [load]);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const next = { ...filters, page: "1" };
    setFilters(next);
    void load(next);
  }

  function handleReset() {
    const next = {
      search: "",
      location: "",
      minRating: "",
      sortBy: "rating",
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
              <Sparkles size={16} /> Human + AI Synergy
            </span>
            <h1>Certified Global Education Advisors</h1>
            <p>
              Connect directly with experienced study abroad counselors, former university admissions committee members, and visa specialists.
            </p>
          </div>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setFiltersOpen((value) => !value)}
          >
            <SlidersHorizontal size={17} />
            {filtersOpen ? "Hide filters" : "Filter advisors"}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <form className="filter-search-form" onSubmit={handleSearchSubmit}>
            <div className="filter-search-input">
              <Search size={18} />
              <input
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Search advisor name, country expertise (e.g. UK, Canada, MBA)..."
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
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split("-");
                const next = { ...filters, sortBy, sortOrder, page: "1" };
                setFilters(next);
                void load(next);
              }}
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="experienceYears-desc">Most Experienced</option>
              <option value="createdAt-desc">Recently Joined</option>
            </select>

            {(filters.search || filters.location || filters.minRating) && (
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
              <label>Destination Expertise / Location</label>
              <input
                value={filters.location}
                onChange={(event) => setFilters({ ...filters, location: event.target.value })}
                placeholder="e.g. London, Toronto, Sydney, USA"
              />
            </div>

            <div className="filter-group">
              <label>Min Advisor Rating</label>
              <select
                value={filters.minRating}
                onChange={(event) => setFilters({ ...filters, minRating: event.target.value })}
              >
                <option value="">Any Rating</option>
                <option value="4.8">4.8+ Stars (Top Rated)</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
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
                Apply filters
              </button>
            </div>
          </div>
        )}

        {/* Advisor Grid */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : technicians.length > 0 ? (
          <>
            <div className="technician-grid">
              {technicians.map((technician) => (
                <TechnicianCard key={technician.id} technician={technician} />
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
            icon={Users}
            title="No education advisors found"
            description="Try changing your search terms or clearing destination filters."
            actionLabel="Reset filters"
            onAction={handleReset}
          />
        )}
      </div>
    </div>
  );
}
