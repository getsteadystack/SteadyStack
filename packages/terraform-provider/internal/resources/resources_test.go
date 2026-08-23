package resources

import (
	"context"
	"testing"

	"github.com/hashicorp/terraform-plugin-framework/resource"
)

func TestMonitorResource_Schema(t *testing.T) {
	ctx := context.Background()
	r := NewMonitorResource()

	var req resource.MetadataRequest
	req.ProviderTypeName = "steadystack"
	var resp resource.MetadataResponse
	r.Metadata(ctx, req, &resp)

	if resp.TypeName != "steadystack_monitor" {
		t.Errorf("Expected type name 'steadystack_monitor', got %s", resp.TypeName)
	}

	var schemaReq resource.SchemaRequest
	var schemaResp resource.SchemaResponse
	r.Schema(ctx, schemaReq, &schemaResp)

	if schemaResp.Diagnostics.HasError() {
		t.Fatalf("Schema diagnostics error: %v", schemaResp.Diagnostics)
	}

	expectedAttrs := []string{"id", "name", "url", "type", "interval", "timeout", "method", "headers", "body", "tags", "check_regions", "alert_threshold", "dynamic_thresholding", "runbook_url"}
	for _, attr := range expectedAttrs {
		if _, ok := schemaResp.Schema.Attributes[attr]; !ok {
			t.Errorf("Expected attribute %q in monitor schema", attr)
		}
	}
}

func TestAlertChannelResource_Schema(t *testing.T) {
	ctx := context.Background()
	r := NewAlertChannelResource()

	var req resource.MetadataRequest
	req.ProviderTypeName = "steadystack"
	var resp resource.MetadataResponse
	r.Metadata(ctx, req, &resp)

	if resp.TypeName != "steadystack_alert_channel" {
		t.Errorf("Expected type name 'steadystack_alert_channel', got %s", resp.TypeName)
	}

	var schemaReq resource.SchemaRequest
	var schemaResp resource.SchemaResponse
	r.Schema(ctx, schemaReq, &schemaResp)

	if schemaResp.Diagnostics.HasError() {
		t.Fatalf("Schema diagnostics error: %v", schemaResp.Diagnostics)
	}

	expectedAttrs := []string{"id", "name", "type", "config_json"}
	for _, attr := range expectedAttrs {
		if _, ok := schemaResp.Schema.Attributes[attr]; !ok {
			t.Errorf("Expected attribute %q in alert channel schema", attr)
		}
	}
}

func TestStatusPageResource_Schema(t *testing.T) {
	ctx := context.Background()
	r := NewStatusPageResource()

	var req resource.MetadataRequest
	req.ProviderTypeName = "steadystack"
	var resp resource.MetadataResponse
	r.Metadata(ctx, req, &resp)

	if resp.TypeName != "steadystack_status_page" {
		t.Errorf("Expected type name 'steadystack_status_page', got %s", resp.TypeName)
	}

	var schemaReq resource.SchemaRequest
	var schemaResp resource.SchemaResponse
	r.Schema(ctx, schemaReq, &schemaResp)

	if schemaResp.Diagnostics.HasError() {
		t.Fatalf("Schema diagnostics error: %v", schemaResp.Diagnostics)
	}

	expectedAttrs := []string{"id", "slug", "title", "description", "custom_domain", "is_private", "password", "show_uptime", "show_response_time", "history_days"}
	for _, attr := range expectedAttrs {
		if _, ok := schemaResp.Schema.Attributes[attr]; !ok {
			t.Errorf("Expected attribute %q in status page schema", attr)
		}
	}
}

func TestAlertRuleResource_Schema(t *testing.T) {
	ctx := context.Background()
	r := NewAlertRuleResource()

	var req resource.MetadataRequest
	req.ProviderTypeName = "steadystack"
	var resp resource.MetadataResponse
	r.Metadata(ctx, req, &resp)

	if resp.TypeName != "steadystack_alert_rule" {
		t.Errorf("Expected type name 'steadystack_alert_rule', got %s", resp.TypeName)
	}

	var schemaReq resource.SchemaRequest
	var schemaResp resource.SchemaResponse
	r.Schema(ctx, schemaReq, &schemaResp)

	if schemaResp.Diagnostics.HasError() {
		t.Fatalf("Schema diagnostics error: %v", schemaResp.Diagnostics)
	}

	expectedAttrs := []string{"id", "monitor_id", "trigger", "threshold", "comparison", "target_status", "enabled", "channel_ids"}
	for _, attr := range expectedAttrs {
		if _, ok := schemaResp.Schema.Attributes[attr]; !ok {
			t.Errorf("Expected attribute %q in alert rule schema", attr)
		}
	}
}
