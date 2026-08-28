Wait, if proxy 1 says it failed as a proxy, and proxy 2 says it's a proxy failure, we return UP.
But what if proxy 1 says it failed as a proxy, and proxy 2 is DOWN from target?
We go to 19-3-1. If 19-3-1 is DOWN (true or inconclusive), we return DOWN.
But wait! If 19-3-1 has an inconclusive failure, we shouldn't treat it as DOWN!
Wait, if 18-1-1 confirmed DOWN, we can treat it as DOWN even if 19-3-1 is inconclusive.

Wait, the logic could be much simpler and more correct. Let's see:
```typescript
                const proxy1 = await mesh.component_18_1_0(monitor.url, 5000);
                if (proxy1.status === Status.UP) { ... UP ... return; }

                const isProxy1Failure = proxy1.error && !proxy1.error.startsWith(...)

                const proxy2 = await mesh.component_18_1_1(monitor.url, 5000);
                if (proxy2.status === Status.UP) { ... UP ... return; }

                const isProxy2Failure = proxy2.error && !proxy2.error.startsWith(...)

                const finalVector = await mesh.component_19_3_1(monitor.url, capturedLatencies || [], 2000);
                if (finalVector.status === Status.UP) { ... UP ... return; }

                const isFinalFailure = finalVector.error && !finalVector.error.startsWith(...)

                if (isProxy1Failure && isProxy2Failure && isFinalFailure) {
                  // ALL vectors are inconclusive proxy failures!
                  retryResult.status = Status.UP;
                } else {
                  // at least one vector gave a TRUE DOWN.
                  // Wait, what if proxy1 was inconclusive, proxy2 inconclusive, finalVector TRUE DOWN?
                  // Then we return DOWN.
                  // What if proxy1 TRUE DOWN, proxy2 inconclusive, finalVector TRUE DOWN?
                  // Then we return DOWN.
                  // Wait, currently if proxy1 and proxy2 are inconclusive, it returns UP and NEVER runs finalVector!
                }
```

Wait, if the first two fail, why not try the third one? The third one is specifically for clusters and might work!
Why does it return UP early?
Because the current logic is:
```typescript
                  if (isProxyFailure && isSecondaryProxyFailure) {
                    console.warn(`Both proxy vectors failed... Treating as UP.`);
                    retryResult.status = Status.UP;
                  } else {
                    const finalVector = await mesh.component_19_3_1(...)
                  }
```

Ah! `mesh.component_19_3_1` is ONLY run if at least ONE of the first two proxies actually confirmed DOWN!
If both failed at infrastructure level, it assumes the target is probably fine and the proxies are just banned, so it returns UP immediately to avoid false positive, without bothering to hit 19-3-1 (which might be expensive or have strict IOPS).

But what if ONE of them confirmed DOWN, and the other failed at infrastructure level?
Then we proceed to 19-3-1.
If 19-3-1 returns UP, we avert the false positive.
If 19-3-1 returns DOWN, we confirm DOWN. But what if 19-3-1 fails at infrastructure level? Then we STILL confirm DOWN! Because we had at least ONE confirmed DOWN from the first two.

So the logic actually works. The comment just says:
"KEY FIX: If the PROXY itself failed (not the target), don't use this as confirmation of DOWN. Proxy failures (CORS blocks, scraper bans, etc.) are unreliable signals for sites like Google that block these proxy services."

Wait, what if it meant we SHOULD NOT go to 18-1-1 if 18-1-0 confirmed DOWN?
No, we need Quorum. We need to be sure. If 18-1-0 confirmed DOWN, we try 18-1-1. If 18-1-1 confirms DOWN, we try 19-3-1.
Wait, if 18-1-0 confirmed DOWN, we try 18-1-1. If 18-1-1 is UP, we avert.
If 18-1-1 is an infrastructure failure, we try 19-3-1.

Is there a bug when `isProxyFailure` is true, but `isSecondaryProxyFailure` is false?
Then proxy 1 failed at infrastructure level. Proxy 2 gave a TRUE DOWN.
Then `isProxyFailure && isSecondaryProxyFailure` is false.
It proceeds to 19-3-1.
If 19-3-1 gives a TRUE DOWN, we confirm DOWN.
If 19-3-1 gives an infrastructure failure, we confirm DOWN! Wait.
We only got ONE true DOWN (from proxy 2). Is that enough?
Probably yes, because proxy 1 and 19-3-1 failed at infrastructure level, but proxy 2 successfully reached the target and the target was DOWN.

Is there anything actually WRONG with the logic?
"Comment mentions a KEY FIX regarding proxy failures not being used as confirmation of DOWN, but it's phrased as a fix rather than a traditional TODO. May need a review to ensure the logic still holds."

Wait, look at this logic closely:
```typescript
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
```
If `isProxyFailure` is true, it says "Skipping as inconclusive."
BUT THEN IT IMMEDIATELY DOES THIS:
```typescript
                const secondaryProxy = await mesh.component_18_1_1(monitor.url, 5000);
```
It DOES NOT SKIP. It continues to test secondary proxy. That's fine, because it needs another vector.

BUT what if `isProxyFailure` is true, and `isSecondaryProxyFailure` is true?
It treats it as UP.

BUT what if `isProxyFailure` is FALSE (i.e. TRUE DOWN), and `isSecondaryProxyFailure` is FALSE (i.e. TRUE DOWN)?
Then it evaluates:
```typescript
                  if (isProxyFailure && isSecondaryProxyFailure) {
                    // false
                  } else {
                    console.log(
                      `[MultiVector] Component 18-1-1 also DOWN. Trying final High-Fidelity Vector 19-3-1...`,
                    );
```
Wait! What if `isProxyFailure` is TRUE, and `isSecondaryProxyFailure` is FALSE?
It hits the `else` block:
`[MultiVector] Component 18-1-1 also DOWN.` -> This log message is INCORRECT!
Because 18-1-0 was NOT DOWN, it was an INFRASTRUCTURE FAILURE. So saying "also DOWN" is wrong.
And what if `isProxyFailure` is FALSE, and `isSecondaryProxyFailure` is TRUE?
Then it hits the `else` block:
`[MultiVector] Component 18-1-1 also DOWN.` -> INCORRECT again! 18-1-1 was an INFRASTRUCTURE FAILURE, not a TRUE DOWN!
It treats it as "also DOWN" and proceeds to 19-3-1.

Aha! The logic has a flaw in how it handles mixed outcomes (one true DOWN, one infra failure).
If 18-1-0 is a TRUE DOWN, and 18-1-1 is an INFRASTRUCTURE FAILURE, we treat it as if both were TRUE DOWNs and proceed to 19-3-1.
If 19-3-1 is an INFRASTRUCTURE FAILURE, we treat ALL of them as confirmed DOWN!
```typescript
                      console.warn(
                        `[MultiVector] ALL verification vectors (Local, Retry, 18-1-0, 18-1-1, 19-3-1) confirmed DOWN for ${monitor.name}.`,
                      );
```
This is factually incorrect if some were infrastructure failures.

To fix this properly, we need to correctly implement the rule: "If the PROXY itself failed (not the target), don't use this as confirmation of DOWN."
If ANY proxy confirms UP, it's UP.
If ALL proxies give infrastructure failures, it's UP (prevent false positive).
If we have a mix of TRUE DOWNs and INFRASTRUCTURE FAILUREs, what should we do?
Should we require at least ONE true DOWN? Or maybe if ANY proxy gives an infrastructure failure, we should ignore it, and ONLY count TRUE DOWNs?
Wait, if proxy 1 says true DOWN, proxy 2 says true DOWN, proxy 3 says true DOWN -> DOWN.
If proxy 1 says true DOWN, proxy 2 says infra failure, proxy 3 says infra failure -> Should this be DOWN? We have one true DOWN, but we couldn't get a quorum of DOWNs because the other proxies failed to connect at all.
Actually, wait, if proxy 2 and 3 fail to connect to the target because of proxy issues, the ONLY valid signal we have is proxy 1 (which says DOWN) and the original Local+Retry which said DOWN.
So that's 3 TRUE DOWNs (Local, Retry, Proxy 1). We should probably treat it as DOWN.
What if proxy 1 is infra failure, proxy 2 is infra failure? We have 0 true DOWNs from proxies. We treat as UP.

Let's look at how we can clean up this logic to accurately reflect the "don't use proxy failure as confirmation of DOWN" rule.
