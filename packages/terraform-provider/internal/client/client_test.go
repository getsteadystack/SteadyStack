package client

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_MonitorsCRUD(t *testing.T) {
	mux := http.NewServeMux()

	// GET /api/v1/monitors/mon-123
	mux.HandleFunc("/api/v1/monitors/mon-123", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			resp := APIResponse[Monitor]{
				Data: Monitor{
					ID:       "mon-123",
					Name:     "Production API",
					URL:      "https://api.example.com/health",
					Type:     "HTTP",
					Interval: 60,
					Timeout:  10,
				},
			}
			json.NewEncoder(w).Encode(resp)
		case http.MethodPatch:
			var m Monitor
			json.NewDecoder(r.Body).Decode(&m)
			m.ID = "mon-123"
			resp := APIResponse[Monitor]{Data: m}
			json.NewEncoder(w).Encode(resp)
		case http.MethodDelete:
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	// POST /api/v1/monitors
	mux.HandleFunc("/api/v1/monitors", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var m Monitor
		json.NewDecoder(r.Body).Decode(&m)
		m.ID = "mon-123"
		w.WriteHeader(http.StatusCreated)
		resp := APIResponse[Monitor]{Data: m}
		json.NewEncoder(w).Encode(resp)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	c := NewClient(server.URL, "pg_live_testkey")

	// 1. Create
	created, err := c.CreateMonitor(&Monitor{
		Name:     "Production API",
		URL:      "https://api.example.com/health",
		Type:     "HTTP",
		Interval: 60,
	})
	if err != nil {
		t.Fatalf("CreateMonitor failed: %v", err)
	}
	if created.ID != "mon-123" {
		t.Errorf("Expected ID 'mon-123', got %s", created.ID)
	}

	// 2. Read
	got, err := c.GetMonitor("mon-123")
	if err != nil {
		t.Fatalf("GetMonitor failed: %v", err)
	}
	if got.Name != "Production API" {
		t.Errorf("Expected name 'Production API', got %s", got.Name)
	}

	// 3. Update
	updated, err := c.UpdateMonitor("mon-123", &Monitor{
		Name: "Production API Updated",
	})
	if err != nil {
		t.Fatalf("UpdateMonitor failed: %v", err)
	}
	if updated.Name != "Production API Updated" {
		t.Errorf("Expected updated name, got %s", updated.Name)
	}

	// 4. Delete
	err = c.DeleteMonitor("mon-123")
	if err != nil {
		t.Fatalf("DeleteMonitor failed: %v", err)
	}
}

func TestClient_AlertChannelsCRUD(t *testing.T) {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/alert-channels/ch-456", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			resp := APIResponse[AlertChannel]{
				Data: AlertChannel{
					ID:   "ch-456",
					Name: "Slack SRE",
					Type: "SLACK",
					Config: map[string]interface{}{
						"webhookUrl": "https://hooks.slack.com/services/xxx",
					},
				},
			}
			json.NewEncoder(w).Encode(resp)
		case http.MethodPatch:
			var ch AlertChannel
			json.NewDecoder(r.Body).Decode(&ch)
			ch.ID = "ch-456"
			ch.Type = "SLACK"
			resp := APIResponse[AlertChannel]{Data: ch}
			json.NewEncoder(w).Encode(resp)
		case http.MethodDelete:
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/alert-channels", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var ch AlertChannel
		json.NewDecoder(r.Body).Decode(&ch)
		ch.ID = "ch-456"
		w.WriteHeader(http.StatusCreated)
		resp := APIResponse[AlertChannel]{Data: ch}
		json.NewEncoder(w).Encode(resp)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	c := NewClient(server.URL, "pg_live_testkey")

	// Create
	created, err := c.CreateAlertChannel(&AlertChannel{
		Name: "Slack SRE",
		Type: "SLACK",
		Config: map[string]interface{}{
			"webhookUrl": "https://hooks.slack.com/services/xxx",
		},
	})
	if err != nil {
		t.Fatalf("CreateAlertChannel failed: %v", err)
	}
	if created.ID != "ch-456" {
		t.Errorf("Expected ID 'ch-456', got %s", created.ID)
	}

	// Read
	got, err := c.GetAlertChannel("ch-456")
	if err != nil {
		t.Fatalf("GetAlertChannel failed: %v", err)
	}
	if got.Type != "SLACK" {
		t.Errorf("Expected type 'SLACK', got %s", got.Type)
	}

	// Update
	updated, err := c.UpdateAlertChannel("ch-456", &AlertChannel{
		Name: "Slack SRE Urgent",
	})
	if err != nil {
		t.Fatalf("UpdateAlertChannel failed: %v", err)
	}
	if updated.Name != "Slack SRE Urgent" {
		t.Errorf("Expected updated name, got %s", updated.Name)
	}

	// Delete
	err = c.DeleteAlertChannel("ch-456")
	if err != nil {
		t.Fatalf("DeleteAlertChannel failed: %v", err)
	}
}

func TestClient_StatusPagesCRUD(t *testing.T) {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/status-pages/sp-789", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			resp := APIResponse[StatusPage]{
				Data: StatusPage{
					ID:          "sp-789",
					Slug:        "test-status",
					Title:       "Test Status Page",
					IsPrivate:   false,
					ShowUptime:  true,
					HistoryDays: 90,
				},
			}
			json.NewEncoder(w).Encode(resp)
		case http.MethodPatch:
			var sp StatusPage
			json.NewDecoder(r.Body).Decode(&sp)
			sp.ID = "sp-789"
			resp := APIResponse[StatusPage]{Data: sp}
			json.NewEncoder(w).Encode(resp)
		case http.MethodDelete:
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/status-pages", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var sp StatusPage
		json.NewDecoder(r.Body).Decode(&sp)
		sp.ID = "sp-789"
		w.WriteHeader(http.StatusCreated)
		resp := APIResponse[StatusPage]{Data: sp}
		json.NewEncoder(w).Encode(resp)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	c := NewClient(server.URL, "pg_live_testkey")

	// Create
	created, err := c.CreateStatusPage(&StatusPage{
		Slug:        "test-status",
		Title:       "Test Status Page",
		ShowUptime:  true,
		HistoryDays: 90,
	})
	if err != nil {
		t.Fatalf("CreateStatusPage failed: %v", err)
	}
	if created.ID != "sp-789" {
		t.Errorf("Expected ID 'sp-789', got %s", created.ID)
	}

	// Read
	got, err := c.GetStatusPage("sp-789")
	if err != nil {
		t.Fatalf("GetStatusPage failed: %v", err)
	}
	if got.Slug != "test-status" {
		t.Errorf("Expected slug 'test-status', got %s", got.Slug)
	}

	// Update
	updated, err := c.UpdateStatusPage("sp-789", &StatusPage{
		Title: "Test Status Page V2",
	})
	if err != nil {
		t.Fatalf("UpdateStatusPage failed: %v", err)
	}
	if updated.Title != "Test Status Page V2" {
		t.Errorf("Expected updated title, got %s", updated.Title)
	}

	// Delete
	err = c.DeleteStatusPage("sp-789")
	if err != nil {
		t.Fatalf("DeleteStatusPage failed: %v", err)
	}
}

func TestClient_AlertRulesCRUD(t *testing.T) {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/alert-rules/ar-101", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			resp := APIResponse[AlertRule]{
				Data: AlertRule{
					ID:           "ar-101",
					MonitorID:    "mon-123",
					Trigger:      "STATUS_CHANGE",
					TargetStatus: "DOWN",
					Enabled:      true,
					ChannelIDs:   []string{"ch-456"},
				},
			}
			json.NewEncoder(w).Encode(resp)
		case http.MethodPatch:
			var ar AlertRule
			json.NewDecoder(r.Body).Decode(&ar)
			ar.ID = "ar-101"
			resp := APIResponse[AlertRule]{Data: ar}
			json.NewEncoder(w).Encode(resp)
		case http.MethodDelete:
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/alert-rules", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var ar AlertRule
		json.NewDecoder(r.Body).Decode(&ar)
		ar.ID = "ar-101"
		w.WriteHeader(http.StatusCreated)
		resp := APIResponse[AlertRule]{Data: ar}
		json.NewEncoder(w).Encode(resp)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	c := NewClient(server.URL, "pg_live_testkey")

	// Create
	created, err := c.CreateAlertRule(&AlertRule{
		MonitorID:    "mon-123",
		Trigger:      "STATUS_CHANGE",
		TargetStatus: "DOWN",
		Enabled:      true,
		ChannelIDs:   []string{"ch-456"},
	})
	if err != nil {
		t.Fatalf("CreateAlertRule failed: %v", err)
	}
	if created.ID != "ar-101" {
		t.Errorf("Expected ID 'ar-101', got %s", created.ID)
	}

	// Read
	got, err := c.GetAlertRule("ar-101")
	if err != nil {
		t.Fatalf("GetAlertRule failed: %v", err)
	}
	if got.Trigger != "STATUS_CHANGE" {
		t.Errorf("Expected trigger 'STATUS_CHANGE', got %s", got.Trigger)
	}

	// Update
	updated, err := c.UpdateAlertRule("ar-101", &AlertRule{
		Trigger: "LATENCY",
	})
	if err != nil {
		t.Fatalf("UpdateAlertRule failed: %v", err)
	}
	if updated.Trigger != "LATENCY" {
		t.Errorf("Expected updated trigger, got %s", updated.Trigger)
	}

	// Delete
	err = c.DeleteAlertRule("ar-101")
	if err != nil {
		t.Fatalf("DeleteAlertRule failed: %v", err)
	}
}

func TestClient_GetRegions(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/regions", func(w http.ResponseWriter, r *http.Request) {
		resp := APIResponse[[]Region]{
			Data: []Region{
				{Code: "wnam", Name: "North America West", Location: "San Jose, CA, US", Flag: "🇺🇸"},
				{Code: "weur", Name: "Western Europe", Location: "Frankfurt, DE", Flag: "🇩🇪"},
			},
		}
		json.NewEncoder(w).Encode(resp)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	c := NewClient(server.URL, "pg_live_testkey")
	regions, err := c.GetRegions()
	if err != nil {
		t.Fatalf("GetRegions failed: %v", err)
	}
	if len(regions) != 2 {
		t.Errorf("Expected 2 regions, got %d", len(regions))
	}
	if regions[0].Code != "wnam" {
		t.Errorf("Expected code 'wnam', got %s", regions[0].Code)
	}
}
