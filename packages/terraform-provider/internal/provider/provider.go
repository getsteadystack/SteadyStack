package provider

import (
	"context"
	"os"

	"github.com/getsteadystack/SteadyStack/terraform-provider-steadystack/internal/client"
	pgdatasource "github.com/getsteadystack/SteadyStack/terraform-provider-steadystack/internal/datasource"
	"github.com/getsteadystack/SteadyStack/terraform-provider-steadystack/internal/resources"
	"github.com/hashicorp/terraform-plugin-framework/datasource"
	"github.com/hashicorp/terraform-plugin-framework/path"
	"github.com/hashicorp/terraform-plugin-framework/provider"
	"github.com/hashicorp/terraform-plugin-framework/provider/schema"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

var _ provider.Provider = &SteadyStackProvider{}

type SteadyStackProvider struct {
	version string
}

type SteadyStackProviderModel struct {
	HostURL types.String `tfsdk:"host_url"`
	APIKey  types.String `tfsdk:"api_key"`
}

func New(version string) func() provider.Provider {
	return func() provider.Provider {
		return &SteadyStackProvider{
			version: version,
		}
	}
}

func (p *SteadyStackProvider) Metadata(ctx context.Context, req provider.MetadataRequest, resp *provider.MetadataResponse) {
	resp.TypeName = "steadystack"
	resp.Version = p.version
}

func (p *SteadyStackProvider) Schema(ctx context.Context, req provider.SchemaRequest, resp *provider.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "SteadyStack provider allows managing monitors, alert channels, and status pages as code.",
		Attributes: map[string]schema.Attribute{
			"host_url": schema.StringAttribute{
				Description: "The base URL for the SteadyStack API. Defaults to https://app.steadystack.dev (or env STEADYSTACK_HOST_URL).",
				Optional:    true,
			},
			"api_key": schema.StringAttribute{
				Description: "API key for authenticating with SteadyStack (or env STEADYSTACK_API_KEY).",
				Optional:    true,
				Sensitive:   true,
			},
		},
	}
}

func (p *SteadyStackProvider) Configure(ctx context.Context, req provider.ConfigureRequest, resp *provider.ConfigureResponse) {
	var config SteadyStackProviderModel
	diags := req.Config.Get(ctx, &config)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	hostURL := os.Getenv("STEADYSTACK_HOST_URL")
	if !config.HostURL.IsNull() {
		hostURL = config.HostURL.ValueString()
	}
	if hostURL == "" {
		hostURL = "https://app.steadystack.dev"
	}

	apiKey := os.Getenv("STEADYSTACK_API_KEY")
	if !config.APIKey.IsNull() {
		apiKey = config.APIKey.ValueString()
	}

	if apiKey == "" {
		resp.Diagnostics.AddAttributeError(
			path.Root("api_key"),
			"Missing SteadyStack API Key",
			"The provider cannot create the SteadyStack API client without an API Key. "+
				"Set the api_key value in the configuration or use the STEADYSTACK_API_KEY environment variable.",
		)
		return
	}

	c := client.NewClient(hostURL, apiKey)
	resp.DataSourceData = c
	resp.ResourceData = c
}

func (p *SteadyStackProvider) Resources(ctx context.Context) []func() resource.Resource {
	return []func() resource.Resource{
		resources.NewMonitorResource,
		resources.NewAlertChannelResource,
		resources.NewStatusPageResource,
		resources.NewAlertRuleResource,
	}
}

func (p *SteadyStackProvider) DataSources(ctx context.Context) []func() datasource.DataSource {
	return []func() datasource.DataSource{
		pgdatasource.NewRegionsDataSource,
	}
}
