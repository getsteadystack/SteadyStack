package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client handles all REST API v1 communications with SteadyStack
type Client struct {
	HostURL    string
	APIKey     string
	HTTPClient *http.Client
}

type Monitor struct {
	ID                  string            `json:"id,omitempty"`
	Name                string            `json:"name"`
	URL                 string            `json:"url"`
	Type                string            `json:"type"`
	Interval            int64             `json:"interval"`
	Timeout             int64             `json:"timeout"`
	Status              string            `json:"status,omitempty"`
	Method              string            `json:"method"`
	Headers             map[string]string `json:"headers,omitempty"`
	Body                string            `json:"body,omitempty"`
	Tags                []string          `json:"tags,omitempty"`
	CheckRegions        []string          `json:"checkRegions,omitempty"`
	AlertThreshold      int64             `json:"alertThreshold"`
	DynamicThresholding bool              `json:"dynamicThresholding"`
	RunbookURL          string            `json:"runbookUrl,omitempty"`
}

type AlertChannel struct {
	ID     string                 `json:"id,omitempty"`
	Name   string                 `json:"name"`
	Type   string                 `json:"type"`
	Config map[string]interface{} `json:"config"`
}

type StatusPage struct {
	ID               string                 `json:"id,omitempty"`
	Slug             string                 `json:"slug"`
	Title            string                 `json:"title"`
	Description      string                 `json:"description,omitempty"`
	CustomDomain     string                 `json:"customDomain,omitempty"`
	IsPrivate        bool                   `json:"isPrivate"`
	Password         string                 `json:"password,omitempty"`
	Theme            map[string]interface{} `json:"theme,omitempty"`
	ShowUptime       bool                   `json:"showUptime"`
	ShowResponseTime bool                   `json:"showResponseTime"`
	HistoryDays      int64                  `json:"historyDays"`
}

type AlertRuleChannel struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

type AlertRule struct {
	ID           string             `json:"id,omitempty"`
	MonitorID    string             `json:"monitorId"`
	Trigger      string             `json:"trigger"`
	Threshold    *int64             `json:"threshold,omitempty"`
	Comparison   string             `json:"comparison,omitempty"`
	TargetStatus string             `json:"targetStatus,omitempty"`
	Enabled      bool               `json:"enabled"`
	ChannelIDs   []string           `json:"channelIds,omitempty"`
	Channels     []AlertRuleChannel `json:"channels,omitempty"`
}

type Region struct {
	Code     string `json:"code"`
	Name     string `json:"name"`
	Location string `json:"location"`
	Flag     string `json:"flag"`
}

type APIResponse[T any] struct {
	Data  T      `json:"data"`
	Count int    `json:"count,omitempty"`
	Error string `json:"error,omitempty"`
}

// NewClient initializes a new SteadyStack API client
func NewClient(host, apiKey string) *Client {
	if host == "" {
		host = "https://app.steadystack.dev"
	}
	host = strings.TrimSuffix(host, "/")

	return &Client{
		HostURL: host,
		APIKey:  apiKey,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) sendRequest(req *http.Request, v interface{}) error {
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.APIKey))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "terraform-provider-steadystack/1.0.0")

	res, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		bodyBytes, _ := io.ReadAll(res.Body)
		return fmt.Errorf("SteadyStack API error (HTTP %d): %s", res.StatusCode, string(bodyBytes))
	}

	if v != nil {
		return json.NewDecoder(res.Body).Decode(v)
	}

	return nil
}

// --- Monitor Operations ---

func (c *Client) GetMonitor(id string) (*Monitor, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/monitors/%s", c.HostURL, id), nil)
	if err != nil {
		return nil, err
	}

	var resp APIResponse[Monitor]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) CreateMonitor(m *Monitor) (*Monitor, error) {
	payload, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/monitors", c.HostURL), bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	var resp APIResponse[Monitor]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) UpdateMonitor(id string, m *Monitor) (*Monitor, error) {
	payload, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("PATCH", fmt.Sprintf("%s/api/v1/monitors/%s", c.HostURL, id), bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	var resp APIResponse[Monitor]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) DeleteMonitor(id string) error {
	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/api/v1/monitors/%s", c.HostURL, id), nil)
	if err != nil {
		return err
	}

	return c.sendRequest(req, nil)
}

// --- Alert Channel Operations ---

func (c *Client) GetAlertChannel(id string) (*AlertChannel, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/alert-channels/%s", c.HostURL, id), nil)
	if err != nil {
		return nil, err
	}

	var resp APIResponse[AlertChannel]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) CreateAlertChannel(ch *AlertChannel) (*AlertChannel, error) {
	payload, err := json.Marshal(ch)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/alert-channels", c.HostURL), bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	var resp APIResponse[AlertChannel]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) UpdateAlertChannel(id string, ch *AlertChannel) (*AlertChannel, error) {
	payload, err := json.Marshal(ch)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("PATCH", fmt.Sprintf("%s/api/v1/alert-channels/%s", c.HostURL, id), bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	var resp APIResponse[AlertChannel]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) DeleteAlertChannel(id string) error {
	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/api/v1/alert-channels/%s", c.HostURL, id), nil)
	if err != nil {
		return err
	}

	return c.sendRequest(req, nil)
}

// --- Status Page Operations ---

func (c *Client) GetStatusPage(id string) (*StatusPage, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/status-pages/%s", c.HostURL, id), nil)
	if err != nil {
		return nil, err
	}

	var resp APIResponse[StatusPage]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) CreateStatusPage(sp *StatusPage) (*StatusPage, error) {
	payload, err := json.Marshal(sp)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/status-pages", c.HostURL), bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	var resp APIResponse[StatusPage]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) UpdateStatusPage(id string, sp *StatusPage) (*StatusPage, error) {
	payload, err := json.Marshal(sp)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("PATCH", fmt.Sprintf("%s/api/v1/status-pages/%s", c.HostURL, id), bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	var resp APIResponse[StatusPage]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return &resp.Data, nil
}

func (c *Client) DeleteStatusPage(id string) error {
	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/api/v1/status-pages/%s", c.HostURL, id), nil)
	if err != nil {
		return err
	}

	return c.sendRequest(req, nil)
}

// --- Alert Rule Operations ---

func (c *Client) GetAlertRule(id string) (*AlertRule, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/alert-rules/%s", c.HostURL, id), nil)
	if err != nil {
		return nil, err
	}

	var resp APIResponse[AlertRule]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	// Populate ChannelIDs from Channels relation if not present
	if len(resp.Data.ChannelIDs) == 0 && len(resp.Data.Channels) > 0 {
		resp.Data.ChannelIDs = make([]string, len(resp.Data.Channels))
		for i, ch := range resp.Data.Channels {
			resp.Data.ChannelIDs[i] = ch.ID
		}
	}

	return &resp.Data, nil
}

func (c *Client) CreateAlertRule(ar *AlertRule) (*AlertRule, error) {
	payload, err := json.Marshal(ar)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/alert-rules", c.HostURL), bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	var resp APIResponse[AlertRule]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	if len(resp.Data.ChannelIDs) == 0 && len(resp.Data.Channels) > 0 {
		resp.Data.ChannelIDs = make([]string, len(resp.Data.Channels))
		for i, ch := range resp.Data.Channels {
			resp.Data.ChannelIDs[i] = ch.ID
		}
	}

	return &resp.Data, nil
}

func (c *Client) UpdateAlertRule(id string, ar *AlertRule) (*AlertRule, error) {
	payload, err := json.Marshal(ar)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("PATCH", fmt.Sprintf("%s/api/v1/alert-rules/%s", c.HostURL, id), bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	var resp APIResponse[AlertRule]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	if len(resp.Data.ChannelIDs) == 0 && len(resp.Data.Channels) > 0 {
		resp.Data.ChannelIDs = make([]string, len(resp.Data.Channels))
		for i, ch := range resp.Data.Channels {
			resp.Data.ChannelIDs[i] = ch.ID
		}
	}

	return &resp.Data, nil
}

func (c *Client) DeleteAlertRule(id string) error {
	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s/api/v1/alert-rules/%s", c.HostURL, id), nil)
	if err != nil {
		return err
	}

	return c.sendRequest(req, nil)
}

// --- Region Operations ---

func (c *Client) GetRegions() ([]Region, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/regions", c.HostURL), nil)
	if err != nil {
		return nil, err
	}

	var resp APIResponse[[]Region]
	if err := c.sendRequest(req, &resp); err != nil {
		return nil, err
	}

	return resp.Data, nil
}
