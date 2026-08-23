import React from "react";

export interface ToolSchemaProps {
  name: string;
  description: string;
  url: string;
  category?: string;
}

export function ToolSchema({
  name,
  description,
  url,
  category = "DeveloperApplication",
}: ToolSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: category,
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    creator: {
      "@type": "Organization",
      name: "SteadyStack",
      url: "https://steadystack.dev",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
