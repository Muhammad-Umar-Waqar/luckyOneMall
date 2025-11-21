// src/slices/VenueSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";

const getToken = () => localStorage.getItem("token");

// fetch all venues
export const fetchAllVenues = createAsyncThunk(
  "Venue/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/venue/all`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch venues");
      // Expected backend returns array of venues
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// create new venue
export const createVenue = createAsyncThunk(
  "Venue/create",
  async ({ name, organization }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");
      const body = { name, organization };

      const res = await fetch(`${BASE}/venue/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create venue");

      // backend returns { message, venue }
      return data.venue;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// update venue
export const updateVenue = createAsyncThunk(
  "Venue/update",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/venue/update/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update venue");

      // backend returns { message, venue }
      return data.venue;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// delete venue
export const deleteVenue = createAsyncThunk(
  "Venue/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/venue/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete venue");

      return id; // return deleted id for reducer
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

export const fetchVenuesByOrganization = createAsyncThunk(
  "Venue/fetchByOrg",
  async (organizationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No authentication token found");

      const res = await fetch(`${BASE}/venue/venue-by-org/${organizationId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch venues");

      // backend returns { venues: [...] } as you showed earlier
      return Array.isArray(data) ? data : data.venues || [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const VenueSlice = createSlice({
  name: "Venue",
  initialState: {
    Venues: [],
    loading: false,
    error: null,
    venuesByOrg: {},
  },
  reducers: {
    setVenues(state, action) {
      state.Venues = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAllVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVenues.fulfilled, (state, action) => {
        state.loading = false;
        // backend returns array
        state.Venues = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch venues";
        state.Venues = [];
      })

      // create
      .addCase(createVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.loading = false;
        // add new venue to the top
        state.Venues = [action.payload, ...state.Venues];
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to create venue";
      })

      // update
      .addCase(updateVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVenue.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated && updated._id) {
          state.Venues = state.Venues.map((v) => (v._id === updated._id ? updated : v));
        }
      })
      .addCase(updateVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to update venue";
      })

      // delete
      .addCase(deleteVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.loading = false;
        const removedId = action.payload;
        state.Venues = state.Venues.filter((v) => v._id !== removedId);
      })
      .addCase(deleteVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to delete venue";
      })
      // fetchVenuesByOrganization cases
      .addCase(fetchVenuesByOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenuesByOrganization.fulfilled, (state, action) => {
        state.loading = false;
        // we don't replace global Venues; instead cache per org
        const payload = Array.isArray(action.payload) ? action.payload : [];
        // NOTE: fetch action.meta.arg is organizationId
        const orgId = action.meta?.arg;
        if (orgId) {
          state.venuesByOrg[orgId] = payload;
        } else {
          state.Venues = payload;
        }
      })
      .addCase(fetchVenuesByOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch venues";
      });
  },
});

export const { setVenues, setLoading, setError } = VenueSlice.actions;
export default VenueSlice.reducer;
