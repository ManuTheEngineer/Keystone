import { describe, it, expect } from "vitest";
import { apiSuccess, apiError } from "@/lib/api-response";

describe("apiSuccess", () => {
  it("returns data in standardized shape", async () => {
    const response = apiSuccess({ plan: "BUILDER" });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ data: { plan: "BUILDER" } });
  });

  it("includes meta when provided", async () => {
    const response = apiSuccess({ rate: 6.5 }, { meta: { source: "api" } });
    const json = await response.json();

    expect(json).toEqual({ data: { rate: 6.5 }, meta: { source: "api" } });
  });

  it("supports custom status codes", async () => {
    const response = apiSuccess({ created: true }, { status: 201 });
    expect(response.status).toBe(201);
  });
});

describe("apiError", () => {
  it("returns error in standardized shape", async () => {
    const response = apiError("Not found", { status: 404 });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
  });

  it("includes details and meta when provided", async () => {
    const response = apiError("Validation failed", {
      status: 400,
      details: ["email: Invalid"],
      meta: { field: "email" },
    });
    const json = await response.json();

    expect(json).toEqual({
      error: "Validation failed",
      details: ["email: Invalid"],
      meta: { field: "email" },
    });
  });
});
