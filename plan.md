The logic here has a subtle issue when the first proxy fails (`isProxyFailure` is true) and the second proxy *succeeds at the proxy level but returns DOWN from the target*.

Let's trace the logic:
1. `isProxyFailure` is checked for `proxyResult`.
2. If `isProxyFailure` is true, we log and "skip to secondary". But wait, the code proceeds to run `secondaryProxy` regardless of whether `isProxyFailure` is true or false.
3. If `secondaryProxy` is UP, we set UP.
4. If `secondaryProxy` is DOWN, we evaluate `isSecondaryProxyFailure`.
5. We then hit the `if (isProxyFailure && isSecondaryProxyFailure)` block.
   - If BOTH are proxy failures, it's treated as UP.
   - Wait, what if `isProxyFailure` is true, but `isSecondaryProxyFailure` is FALSE?
   - In that case, `isProxyFailure && isSecondaryProxyFailure` is FALSE.
   - The code proceeds to the `else` block: "Component 18-1-1 also DOWN. Trying final High-Fidelity Vector 19-3-1..."
   - And if that returns DOWN, the overall result stays DOWN.

Is this wrong? Wait, if proxy 1 fails at proxy level, it's inconclusive.
Then we try proxy 2. Proxy 2 works at the proxy level, and the TARGET is DOWN.
This is a confirmed DOWN. The logic handles it by proceeding to 19-3-1.

What if `isProxyFailure` is FALSE, and `isSecondaryProxyFailure` is TRUE?
- Proxy 1 returns DOWN from TARGET.
- Proxy 2 fails at PROXY level.
- `isProxyFailure && isSecondaryProxyFailure` is FALSE.
- The code proceeds to the `else` block, tries 19-3-1, and potentially stays DOWN.
This is also correct! Proxy 1 confirmed it's down.

Wait, what if `isProxyFailure` is TRUE?
Then the logic should completely skip proxy 1's DOWN result. But wait, it doesn't really "skip" proxy 1, it just continues.
If proxy 1 failed at the proxy level, the target might actually be UP.
If proxy 2 *also* fails at the proxy level, the code says "Both proxies failed... treating as UP". That's correct.

BUT wait. Look at `process-batch.ts:353-362`.
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
If `isProxyFailure` is true, it logs, then it continues to evaluate `secondaryProxy`.
If `secondaryProxy` is DOWN and `isSecondaryProxyFailure` is TRUE, it treats it as UP.
If `secondaryProxy` is DOWN and `isSecondaryProxyFailure` is FALSE, it treats it as DOWN.
This all seems correct.

Wait! What if we want to change this from a "comment" to an actual structured rule?
Or maybe the "KEY FIX" comment is just what needs to be reviewed and rewritten or clarified?
Let's check the memory:
"In `apps/worker`'s multi-vector monitoring system, proxy components (`mesh.ts`) prefix true target errors with `TARGET_HTTP_`, `HTTP_`, or `CLUSTER_HTTP_`. Any other error (e.g., generic fetch failures, `PROXY_FETCH_FAILED`, `PROXY_UNAVAILABLE`) must be treated as an inconclusive infrastructure failure, not as definitive target downtime."

Yes, the logic correctly handles `!proxyResult.error.startsWith("TARGET_HTTP_") && ...`.
But wait! Are we returning "inconclusive" early?
No, we fall through to the secondary proxy. What if the secondary proxy is NOT evaluated when it should be?
Wait, if proxy 1 gives a true DOWN (i.e. `isProxyFailure` is FALSE), and then proxy 2 gives a PROXY FAILURE (`isSecondaryProxyFailure` is TRUE).
In that case, `isProxyFailure && isSecondaryProxyFailure` is FALSE.
The logic proceeds to the next block, testing 19-3-1. If 19-3-1 confirms DOWN, it's DOWN. If 19-3-1 fails, it might still report DOWN.
Is that correct? Yes, because proxy 1 already gave a true DOWN.

But wait, look at the memory:
"Any other error (e.g., generic fetch failures, `PROXY_FETCH_FAILED`, `PROXY_UNAVAILABLE`) must be treated as an inconclusive infrastructure failure, not as definitive target downtime."

If the original check (retryResult) was DOWN.
And proxy 1 gave an inconclusive failure.
And proxy 2 gave an inconclusive failure.
It treats it as UP (preventing false positive).

What if proxy 1 gave a true DOWN, and proxy 2 gave an inconclusive failure.
Then `isProxyFailure && isSecondaryProxyFailure` is false.
It proceeds to 19-3-1. If 19-3-1 gives an inconclusive failure, it treats the whole thing as DOWN!
Wait, 19-3-1 has its own errors.
```typescript
                    const finalVector = await mesh.component_19_3_1(...);
                    if (finalVector.status === Status.UP) { ... }
                    else {
                      // ALL verification vectors confirmed DOWN.
                      // But wait! Did 19-3-1 confirm DOWN, or did it have a proxy failure?
                      console.warn(`[MultiVector] ALL verification vectors ... confirmed DOWN`);
                    }
```
Ah! If 19-3-1 has an inconclusive failure, it just falls through and the monitor stays DOWN!
Wait, what if proxy 1 and proxy 2 gave inconclusive failures, and we treated it as UP, we wouldn't reach 19-3-1.
But if proxy 1 gave an inconclusive failure, proxy 2 gave a true DOWN, we reach 19-3-1. If 19-3-1 gives an inconclusive failure, it stays DOWN. This is probably fine because proxy 2 gave a true DOWN.

BUT what if proxy 1 gave a TRUE DOWN, and proxy 2 gave an INCONCLUSIVE failure? We reach 19-3-1. If 19-3-1 gives an INCONCLUSIVE failure, it stays DOWN. Again, fine, because proxy 1 gave a true DOWN.

What if there's a bug in the condition?
```typescript
                const isProxyFailure =
                  proxyResult.error &&
                  !proxyResult.error.startsWith("TARGET_HTTP_") &&
                  !proxyResult.error.startsWith("HTTP_") &&
                  !proxyResult.error.startsWith("CLUSTER_HTTP_");
```
Wait, if `proxyResult.error` is undefined, `isProxyFailure` is undefined (falsy). That's fine.

Is there any issue with this logic?
Let's review the task description:
"Comment mentions a KEY FIX regarding proxy failures not being used as confirmation of DOWN, but it's phrased as a fix rather than a traditional TODO. May need a review to ensure the logic still holds."
"It requires understanding the broader proxy fallback strategy."

What if the issue is that if `isProxyFailure` is true, we shouldn't even proceed to treat it as a "confirmation"?
Wait. If `isProxyFailure` is true, we try the secondary proxy.
If the secondary proxy ALSO has `isProxyFailure`, we treat it as UP.
But what if the secondary proxy is NOT a proxy failure, but returns a TRUE DOWN? Then it goes to 19-3-1. That's fine.
What if the secondary proxy is a PROXY FAILURE, but proxy 1 was a TRUE DOWN?
Then `isProxyFailure && isSecondaryProxyFailure` is false.
It proceeds to 19-3-1. If 19-3-1 gives a PROXY FAILURE, we treat it as DOWN?

Wait, what if we refactor this entire block to cleanly handle each proxy's result instead of this messy nested logic?

Let's rethink the proxy fallback logic:
We want to verify if the target is truly DOWN. We have 3 external vectors (18-1-0, 18-1-1, 19-3-1).
If ANY of them say the target is UP, the target is UP.
If ALL of them say the target is DOWN (and are NOT inconclusive proxy failures), the target is DOWN.
If ALL of them are inconclusive proxy failures, we cannot confirm DOWN, so we should treat it as UP (false positive prevention).

Currently:
- Try 18-1-0. If UP, return UP.
- If 18-1-0 DOWN:
  - Try 18-1-1. If UP, return UP.
  - If 18-1-1 DOWN:
    - If 18-1-0 was inconclusive AND 18-1-1 was inconclusive, return UP.
    - Else:
      - Try 19-3-1. If UP, return UP.
      - If 19-3-1 DOWN:
        - Return DOWN.

Wait! If 18-1-0 is inconclusive, and 18-1-1 is a TRUE DOWN, we try 19-3-1. If 19-3-1 is DOWN (true or inconclusive), we return DOWN. That makes sense (we got at least one TRUE DOWN).
What if 18-1-0 is a TRUE DOWN, and 18-1-1 is inconclusive, and 19-3-1 is inconclusive? We return DOWN. (At least one TRUE DOWN).
What if 18-1-0 is inconclusive, 18-1-1 is inconclusive? We return UP (without trying 19-3-1).
Wait, why don't we try 19-3-1 if the first two are inconclusive? 19-3-1 is the "Final High-Fidelity Vector".
If the first two proxies failed due to CORS/scraper bans, maybe 19-3-1 (Cluster Data) would succeed! But we abort early and return UP!
Is that correct?
"BOTH proxies failed at the infrastructure level — this is a proxy network problem, NOT a confirmed target outage. Treat as inconclusive -> keep UP."
If we return UP, we don't try 19-3-1. That seems wrong? 19-3-1 is another vector, we should try it if we haven't confirmed DOWN. But returning UP is safer to prevent false positives.

Wait, if we treat proxy failures as inconclusive, we shouldn't use them as "confirmation of DOWN".
If ALL proxies fail at the proxy level, it's inconclusive.
But wait! There is a helper function `evaluateQuorum`? Let's check `apps/worker/src/services/quorum-engine.ts`.
