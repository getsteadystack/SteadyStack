The goal is to fix the proxy fallback logic and formalize the rule. The comment says:
`// KEY FIX: If the PROXY itself failed (not the target), don't use this as confirmation of DOWN...`
The issue is that it's implemented as a one-off for 18-1-0 and 18-1-1, and there is messy conditional logging.

I will implement a single, unified "proxy failure check" for all 3 proxy vectors.
And if all evaluated proxies returned infrastructure failures, we treat it as inconclusive (UP).

Wait, the logic is:
```typescript
<<<<<<< SEARCH
                // KEY FIX: If the PROXY itself failed (not the target), don't use this as
                // confirmation of DOWN. Proxy failures (CORS blocks, scraper bans, etc.) are
                // unreliable signals for sites like Google that block these proxy services.
                const isProxyFailure =
                  proxyResult.error &&
                  !proxyResult.error.startsWith("TARGET_HTTP_") &&
                  !proxyResult.error.startsWith("HTTP_") &&
                  !proxyResult.error.startsWith("CLUSTER_HTTP_");

                if (isProxyFailure) {
                  console.warn(
                    `[MultiVector] Component 18-1-0 proxy itself failed (${proxyResult.error}), not a target failure. Skipping as inconclusive.`,
                  );
                  // Don't use a broken proxy as evidence of DOWN — skip to secondary
                } else {
                  console.log(
                    `[MultiVector] Component 18-1-0 target confirmed DOWN. Trying secondary vector Component 18-1-1...`,
                  );
                }

                const secondaryProxy = await mesh.component_18_1_1(monitor.url, 5000);
                if (secondaryProxy.status === Status.UP) {
                  console.log(
                    `[MultiVector] Component 18-1-1 reported UP! False positive averted for ${monitor.name}.`,
                  );
                  retryResult.status = Status.UP;
                  delete retryResult.errorReason;
                } else {
                  // Check if secondary proxy also just failed at the proxy level
                  const isSecondaryProxyFailure =
                    secondaryProxy.error &&
                    !secondaryProxy.error.startsWith("TARGET_HTTP_") &&
                    !secondaryProxy.error.startsWith("HTTP_") &&
                    !secondaryProxy.error.startsWith("CLUSTER_HTTP_");

                  if (isProxyFailure && isSecondaryProxyFailure) {
                    // BOTH proxies failed at the infrastructure level — this is a proxy network
                    // problem, NOT a confirmed target outage. Treat as inconclusive → keep UP.
                    console.warn(
                      `[MultiVector] Both proxy vectors failed at infrastructure level for ${monitor.name}. ` +
                        `Cannot confirm DOWN without reliable external verification. Treating as UP (false-positive prevention).`,
                    );
                    retryResult.status = Status.UP;
                    delete retryResult.errorReason;
                  } else {
                    console.log(
                      `[MultiVector] Component 18-1-1 also DOWN. Trying final High-Fidelity Vector 19-3-1...`,
                    );
                    // Use captured latencies for quantum verification if available
                    const finalVector = await mesh.component_19_3_1(
                      monitor.url,
                      capturedLatencies || [],
                      2000,
                    );
                    if (finalVector.status === Status.UP) {
                      console.log(
                        `[MultiVector] Component 19-3-1 reported UP! False positive averted for ${monitor.name}. (Anomaly: ${finalVector.anomaly?.isAnomaly})`,
                      );
                      retryResult.status = Status.UP;
                      delete retryResult.errorReason;
                    } else {
                      console.warn(
                        `[MultiVector] ALL verification vectors (Local, Retry, 18-1-0, 18-1-1, 19-3-1) confirmed DOWN for ${monitor.name}.`,
                      );
                    }
                  }
                }
=======
                const isProxyFailure =
                  proxyResult.error &&
                  !proxyResult.error.startsWith("TARGET_HTTP_") &&
                  !proxyResult.error.startsWith("HTTP_") &&
                  !proxyResult.error.startsWith("CLUSTER_HTTP_");

                if (isProxyFailure) {
                  console.warn(
                    `[MultiVector] Component 18-1-0 proxy itself failed (${proxyResult.error}), not a target failure. Skipping as inconclusive.`,
                  );
                } else {
                  console.log(
                    `[MultiVector] Component 18-1-0 target confirmed DOWN. Trying secondary vector Component 18-1-1...`,
                  );
                }

                const secondaryProxy = await mesh.component_18_1_1(monitor.url, 5000);
                if (secondaryProxy.status === Status.UP) {
                  console.log(
                    `[MultiVector] Component 18-1-1 reported UP! False positive averted for ${monitor.name}.`,
                  );
                  retryResult.status = Status.UP;
                  delete retryResult.errorReason;
                } else {
                  const isSecondaryProxyFailure =
                    secondaryProxy.error &&
                    !secondaryProxy.error.startsWith("TARGET_HTTP_") &&
                    !secondaryProxy.error.startsWith("HTTP_") &&
                    !secondaryProxy.error.startsWith("CLUSTER_HTTP_");

                  if (isSecondaryProxyFailure) {
                    console.warn(
                      `[MultiVector] Component 18-1-1 proxy itself failed (${secondaryProxy.error}), not a target failure. Skipping as inconclusive.`,
                    );
                  } else {
                    console.log(
                      `[MultiVector] Component 18-1-1 target confirmed DOWN.`,
                    );
                  }

                  if (isProxyFailure && isSecondaryProxyFailure) {
                    // BOTH proxies failed at the infrastructure level — this is a proxy network
                    // problem, NOT a confirmed target outage. Treat as inconclusive → keep UP.
                    console.warn(
                      `[MultiVector] Both proxy vectors failed at infrastructure level for ${monitor.name}. ` +
                        `Cannot confirm DOWN without reliable external verification. Treating as UP (false-positive prevention).`,
                    );
                    retryResult.status = Status.UP;
                    delete retryResult.errorReason;
                  } else {
                    console.log(
                      `[MultiVector] Proceeding to final High-Fidelity Vector 19-3-1 for ${monitor.name}...`,
                    );

                    const finalVector = await mesh.component_19_3_1(
                      monitor.url,
                      capturedLatencies || [],
                      2000,
                    );

                    if (finalVector.status === Status.UP) {
                      console.log(
                        `[MultiVector] Component 19-3-1 reported UP! False positive averted for ${monitor.name}. (Anomaly: ${finalVector.anomaly?.isAnomaly})`,
                      );
                      retryResult.status = Status.UP;
                      delete retryResult.errorReason;
                    } else {
                      const isFinalProxyFailure =
                        finalVector.error &&
                        !finalVector.error.startsWith("TARGET_HTTP_") &&
                        !finalVector.error.startsWith("HTTP_") &&
                        !finalVector.error.startsWith("CLUSTER_HTTP_");

                      if (isFinalProxyFailure) {
                        console.warn(
                          `[MultiVector] Component 19-3-1 proxy itself failed (${finalVector.error}), skipping as inconclusive.`,
                        );
                      }

                      console.warn(
                        `[MultiVector] Verification vectors confirmed DOWN for ${monitor.name}.`,
                      );
                    }
                  }
                }
>>>>>>> REPLACE
```
