package resources

import (
	"context"
	"fmt"

	"github.com/getsteadystack/SteadyStack/terraform-provider-steadystack/internal/client"
	"github.com/hashicorp/terraform-plugin-framework/path"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema/booldefault"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema/planmodifier"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema/stringdefault"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema/stringplanmodifier"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

var (
	_ resource.Resource                = &AlertRuleResource{}
	_ resource.ResourceWithConfigure   = &AlertRuleResource{}
	_ resource.ResourceWithImportState = &AlertRuleResource{}
)

func NewAlertRuleResource() resource.Resource {
	return &AlertRuleResource{}
}

type AlertRuleResource struct {
	client *client.Client
}

type AlertRuleResourceModel struct {
	ID           types.String `tfsdk:"id"`
	MonitorID    types.String `tfsdk:"monitor_id"`
	Trigger      types.String `tfsdk:"trigger"`
	Threshold    types.Int64  `tfsdk:"threshold"`
	Comparison   types.String `tfsdk:"comparison"`
	TargetStatus types.String `tfsdk:"target_status"`
	Enabled      types.Bool   `tfsdk:"enabled"`
	ChannelIDs   types.List   `tfsdk:"channel_ids"`
}

func (r *AlertRuleResource) Metadata(ctx context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_alert_rule"
}

func (r *AlertRuleResource) Schema(ctx context.Context, req resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a SteadyStack alert routing rule linking monitors to notification channels.",
		Attributes: map[string]schema.Attribute{
			"id": schema.StringAttribute{
				Description: "The unique identifier of the alert rule.",
				Computed:    true,
				PlanModifiers: []planmodifier.String{
					stringplanmodifier.UseStateForUnknown(),
				},
			},
			"monitor_id": schema.StringAttribute{
				Description: "The ID of the monitor this alert rule applies to.",
				Required:    true,
				PlanModifiers: []planmodifier.String{
					stringplanmodifier.RequiresReplace(),
				},
			},
			"trigger": schema.StringAttribute{
				Description: "Trigger condition type: STATUS_CHANGE, LATENCY, SSL_EXPIRY, DNS_WATCHDOG, DOMAIN_EXPIRY. Defaults to STATUS_CHANGE.",
				Optional:    true,
				Computed:    true,
				Default:     stringdefault.StaticString("STATUS_CHANGE"),
			},
			"threshold": schema.Int64Attribute{
				Description: "Threshold value in milliseconds (for LATENCY) or days (for SSL/DOMAIN expiry).",
				Optional:    true,
			},
			"comparison": schema.StringAttribute{
				Description: "Comparison operator: GT (greater than), LT (less than).",
				Optional:    true,
			},
			"target_status": schema.StringAttribute{
				Description: "Target monitor state to trigger on (e.g. DOWN, DEGRADED, UP). Defaults to DOWN.",
				Optional:    true,
				Computed:    true,
				Default:     stringdefault.StaticString("DOWN"),
			},
			"enabled": schema.BoolAttribute{
				Description: "Whether the alert rule is actively evaluated. Defaults to true.",
				Optional:    true,
				Computed:    true,
				Default:     booldefault.StaticBool(true),
			},
			"channel_ids": schema.ListAttribute{
				Description: "List of notification channel IDs to dispatch alerts to.",
				Optional:    true,
				ElementType: types.StringType,
			},
		},
	}
}

func (r *AlertRuleResource) Configure(ctx context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
	if req.ProviderData == nil {
		return
	}
	c, ok := req.ProviderData.(*client.Client)
	if !ok {
		resp.Diagnostics.AddError("Unexpected Resource Configure Type", fmt.Sprintf("Expected *client.Client, got: %T", req.ProviderData))
		return
	}
	r.client = c
}

func (r *AlertRuleResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan AlertRuleResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	var channelIDs []string
	if !plan.ChannelIDs.IsNull() && !plan.ChannelIDs.IsUnknown() {
		diags = plan.ChannelIDs.ElementsAs(ctx, &channelIDs, false)
		resp.Diagnostics.Append(diags...)
		if resp.Diagnostics.HasError() {
			return
		}
	}

	var thresholdPtr *int64
	if !plan.Threshold.IsNull() && !plan.Threshold.IsUnknown() {
		val := plan.Threshold.ValueInt64()
		thresholdPtr = &val
	}

	ar := &client.AlertRule{
		MonitorID:    plan.MonitorID.ValueString(),
		Trigger:      plan.Trigger.ValueString(),
		Threshold:    thresholdPtr,
		Comparison:   plan.Comparison.ValueString(),
		TargetStatus: plan.TargetStatus.ValueString(),
		Enabled:      plan.Enabled.ValueBool(),
		ChannelIDs:   channelIDs,
	}

	created, err := r.client.CreateAlertRule(ar)
	if err != nil {
		resp.Diagnostics.AddError("Error Creating SteadyStack Alert Rule", err.Error())
		return
	}

	plan.ID = types.StringValue(created.ID)
	plan.Trigger = types.StringValue(created.Trigger)
	if created.Threshold != nil {
		plan.Threshold = types.Int64Value(*created.Threshold)
	} else {
		plan.Threshold = types.Int64Null()
	}
	if created.Comparison != "" {
		plan.Comparison = types.StringValue(created.Comparison)
	} else {
		plan.Comparison = types.StringNull()
	}
	if created.TargetStatus != "" {
		plan.TargetStatus = types.StringValue(created.TargetStatus)
	}
	plan.Enabled = types.BoolValue(created.Enabled)

	if len(created.ChannelIDs) > 0 {
		listVal, d := types.ListValueFrom(ctx, types.StringType, created.ChannelIDs)
		resp.Diagnostics.Append(d...)
		plan.ChannelIDs = listVal
	} else {
		listVal, d := types.ListValueFrom(ctx, types.StringType, []string{})
		resp.Diagnostics.Append(d...)
		plan.ChannelIDs = listVal
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
}

func (r *AlertRuleResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	var state AlertRuleResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	ar, err := r.client.GetAlertRule(state.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Error Reading SteadyStack Alert Rule", err.Error())
		return
	}

	state.MonitorID = types.StringValue(ar.MonitorID)
	state.Trigger = types.StringValue(ar.Trigger)
	if ar.Threshold != nil {
		state.Threshold = types.Int64Value(*ar.Threshold)
	} else {
		state.Threshold = types.Int64Null()
	}
	if ar.Comparison != "" {
		state.Comparison = types.StringValue(ar.Comparison)
	} else {
		state.Comparison = types.StringNull()
	}
	if ar.TargetStatus != "" {
		state.TargetStatus = types.StringValue(ar.TargetStatus)
	}
	state.Enabled = types.BoolValue(ar.Enabled)

	if len(ar.ChannelIDs) > 0 {
		listVal, d := types.ListValueFrom(ctx, types.StringType, ar.ChannelIDs)
		resp.Diagnostics.Append(d...)
		state.ChannelIDs = listVal
	} else {
		listVal, d := types.ListValueFrom(ctx, types.StringType, []string{})
		resp.Diagnostics.Append(d...)
		state.ChannelIDs = listVal
	}

	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
}

func (r *AlertRuleResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	var plan AlertRuleResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	var channelIDs []string
	if !plan.ChannelIDs.IsNull() && !plan.ChannelIDs.IsUnknown() {
		diags = plan.ChannelIDs.ElementsAs(ctx, &channelIDs, false)
		resp.Diagnostics.Append(diags...)
		if resp.Diagnostics.HasError() {
			return
		}
	}

	var thresholdPtr *int64
	if !plan.Threshold.IsNull() && !plan.Threshold.IsUnknown() {
		val := plan.Threshold.ValueInt64()
		thresholdPtr = &val
	}

	ar := &client.AlertRule{
		MonitorID:    plan.MonitorID.ValueString(),
		Trigger:      plan.Trigger.ValueString(),
		Threshold:    thresholdPtr,
		Comparison:   plan.Comparison.ValueString(),
		TargetStatus: plan.TargetStatus.ValueString(),
		Enabled:      plan.Enabled.ValueBool(),
		ChannelIDs:   channelIDs,
	}

	updated, err := r.client.UpdateAlertRule(plan.ID.ValueString(), ar)
	if err != nil {
		resp.Diagnostics.AddError("Error Updating SteadyStack Alert Rule", err.Error())
		return
	}

	plan.Trigger = types.StringValue(updated.Trigger)
	if updated.Threshold != nil {
		plan.Threshold = types.Int64Value(*updated.Threshold)
	} else {
		plan.Threshold = types.Int64Null()
	}
	if updated.Comparison != "" {
		plan.Comparison = types.StringValue(updated.Comparison)
	} else {
		plan.Comparison = types.StringNull()
	}
	if updated.TargetStatus != "" {
		plan.TargetStatus = types.StringValue(updated.TargetStatus)
	}
	plan.Enabled = types.BoolValue(updated.Enabled)

	if len(updated.ChannelIDs) > 0 {
		listVal, d := types.ListValueFrom(ctx, types.StringType, updated.ChannelIDs)
		resp.Diagnostics.Append(d...)
		plan.ChannelIDs = listVal
	} else {
		listVal, d := types.ListValueFrom(ctx, types.StringType, []string{})
		resp.Diagnostics.Append(d...)
		plan.ChannelIDs = listVal
	}

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
}

func (r *AlertRuleResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	var state AlertRuleResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.client.DeleteAlertRule(state.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Error Deleting SteadyStack Alert Rule", err.Error())
		return
	}
}

func (r *AlertRuleResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	resource.ImportStatePassthroughID(ctx, path.Root("id"), req, resp)
}
