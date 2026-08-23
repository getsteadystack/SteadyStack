package resources

import (
	"context"
	"fmt"

	"github.com/getsteadystack/SteadyStack/terraform-provider-steadystack/internal/client"
	"github.com/hashicorp/terraform-plugin-framework/path"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema/booldefault"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema/int64default"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema/planmodifier"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema/stringplanmodifier"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

var (
	_ resource.Resource                = &StatusPageResource{}
	_ resource.ResourceWithConfigure   = &StatusPageResource{}
	_ resource.ResourceWithImportState = &StatusPageResource{}
)

func NewStatusPageResource() resource.Resource {
	return &StatusPageResource{}
}

type StatusPageResource struct {
	client *client.Client
}

type StatusPageResourceModel struct {
	ID               types.String `tfsdk:"id"`
	Slug             types.String `tfsdk:"slug"`
	Title            types.String `tfsdk:"title"`
	Description      types.String `tfsdk:"description"`
	CustomDomain     types.String `tfsdk:"custom_domain"`
	IsPrivate        types.Bool   `tfsdk:"is_private"`
	Password         types.String `tfsdk:"password"`
	ShowUptime       types.Bool   `tfsdk:"show_uptime"`
	ShowResponseTime types.Bool   `tfsdk:"show_response_time"`
	HistoryDays      types.Int64  `tfsdk:"history_days"`
}

func (r *StatusPageResource) Metadata(ctx context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_status_page"
}

func (r *StatusPageResource) Schema(ctx context.Context, req resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a SteadyStack public or private status page.",
		Attributes: map[string]schema.Attribute{
			"id": schema.StringAttribute{
				Description: "The unique identifier of the status page.",
				Computed:    true,
				PlanModifiers: []planmodifier.String{
					stringplanmodifier.UseStateForUnknown(),
				},
			},
			"slug": schema.StringAttribute{
				Description: "The unique URL slug for the status page (e.g., 'acme-status').",
				Required:    true,
			},
			"title": schema.StringAttribute{
				Description: "The public title of the status page.",
				Required:    true,
			},
			"description": schema.StringAttribute{
				Description: "A brief description or subtitle displayed on the status page.",
				Optional:    true,
			},
			"custom_domain": schema.StringAttribute{
				Description: "Custom CNAME domain for the status page (e.g., 'status.example.com').",
				Optional:    true,
			},
			"is_private": schema.BoolAttribute{
				Description: "Whether the status page requires authentication or password access. Defaults to false.",
				Optional:    true,
				Computed:    true,
				Default:     booldefault.StaticBool(false),
			},
			"password": schema.StringAttribute{
				Description: "Password protection for private status pages.",
				Optional:    true,
				Sensitive:   true,
			},
			"show_uptime": schema.BoolAttribute{
				Description: "Whether to show historical uptime percentages. Defaults to true.",
				Optional:    true,
				Computed:    true,
				Default:     booldefault.StaticBool(true),
			},
			"show_response_time": schema.BoolAttribute{
				Description: "Whether to display response time charts. Defaults to true.",
				Optional:    true,
				Computed:    true,
				Default:     booldefault.StaticBool(true),
			},
			"history_days": schema.Int64Attribute{
				Description: "Number of history days to display on the timeline (30, 60, or 90). Defaults to 90.",
				Optional:    true,
				Computed:    true,
				Default:     int64default.StaticInt64(90),
			},
		},
	}
}

func (r *StatusPageResource) Configure(ctx context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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

func (r *StatusPageResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan StatusPageResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	sp := &client.StatusPage{
		Slug:             plan.Slug.ValueString(),
		Title:            plan.Title.ValueString(),
		Description:      plan.Description.ValueString(),
		CustomDomain:     plan.CustomDomain.ValueString(),
		IsPrivate:        plan.IsPrivate.ValueBool(),
		Password:         plan.Password.ValueString(),
		ShowUptime:       plan.ShowUptime.ValueBool(),
		ShowResponseTime: plan.ShowResponseTime.ValueBool(),
		HistoryDays:      plan.HistoryDays.ValueInt64(),
	}

	created, err := r.client.CreateStatusPage(sp)
	if err != nil {
		resp.Diagnostics.AddError("Error Creating SteadyStack Status Page", err.Error())
		return
	}

	plan.ID = types.StringValue(created.ID)
	plan.Slug = types.StringValue(created.Slug)
	plan.Title = types.StringValue(created.Title)
	if created.Description != "" {
		plan.Description = types.StringValue(created.Description)
	}
	if created.CustomDomain != "" {
		plan.CustomDomain = types.StringValue(created.CustomDomain)
	}
	plan.IsPrivate = types.BoolValue(created.IsPrivate)
	plan.ShowUptime = types.BoolValue(created.ShowUptime)
	plan.ShowResponseTime = types.BoolValue(created.ShowResponseTime)
	plan.HistoryDays = types.Int64Value(created.HistoryDays)

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
}

func (r *StatusPageResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	var state StatusPageResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	sp, err := r.client.GetStatusPage(state.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Error Reading SteadyStack Status Page", err.Error())
		return
	}

	state.Slug = types.StringValue(sp.Slug)
	state.Title = types.StringValue(sp.Title)
	if sp.Description != "" {
		state.Description = types.StringValue(sp.Description)
	} else {
		state.Description = types.StringNull()
	}

	if sp.CustomDomain != "" {
		state.CustomDomain = types.StringValue(sp.CustomDomain)
	} else {
		state.CustomDomain = types.StringNull()
	}

	state.IsPrivate = types.BoolValue(sp.IsPrivate)
	state.ShowUptime = types.BoolValue(sp.ShowUptime)
	state.ShowResponseTime = types.BoolValue(sp.ShowResponseTime)
	state.HistoryDays = types.Int64Value(sp.HistoryDays)

	diags = resp.State.Set(ctx, &state)
	resp.Diagnostics.Append(diags...)
}

func (r *StatusPageResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	var plan StatusPageResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	sp := &client.StatusPage{
		Slug:             plan.Slug.ValueString(),
		Title:            plan.Title.ValueString(),
		Description:      plan.Description.ValueString(),
		CustomDomain:     plan.CustomDomain.ValueString(),
		IsPrivate:        plan.IsPrivate.ValueBool(),
		Password:         plan.Password.ValueString(),
		ShowUptime:       plan.ShowUptime.ValueBool(),
		ShowResponseTime: plan.ShowResponseTime.ValueBool(),
		HistoryDays:      plan.HistoryDays.ValueInt64(),
	}

	updated, err := r.client.UpdateStatusPage(plan.ID.ValueString(), sp)
	if err != nil {
		resp.Diagnostics.AddError("Error Updating SteadyStack Status Page", err.Error())
		return
	}

	plan.Slug = types.StringValue(updated.Slug)
	plan.Title = types.StringValue(updated.Title)
	if updated.Description != "" {
		plan.Description = types.StringValue(updated.Description)
	} else {
		plan.Description = types.StringNull()
	}

	if updated.CustomDomain != "" {
		plan.CustomDomain = types.StringValue(updated.CustomDomain)
	} else {
		plan.CustomDomain = types.StringNull()
	}

	plan.IsPrivate = types.BoolValue(updated.IsPrivate)
	plan.ShowUptime = types.BoolValue(updated.ShowUptime)
	plan.ShowResponseTime = types.BoolValue(updated.ShowResponseTime)
	plan.HistoryDays = types.Int64Value(updated.HistoryDays)

	diags = resp.State.Set(ctx, plan)
	resp.Diagnostics.Append(diags...)
}

func (r *StatusPageResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	var state StatusPageResourceModel
	diags := req.State.Get(ctx, &state)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	err := r.client.DeleteStatusPage(state.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Error Deleting SteadyStack Status Page", err.Error())
		return
	}
}

func (r *StatusPageResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	resource.ImportStatePassthroughID(ctx, path.Root("id"), req, resp)
}
