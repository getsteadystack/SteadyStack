import { describe, test, expect, afterAll } from "bun:test";
import { checkSmtp } from "../index";

/**
 * SMTP happy-path tests against a local Bun TCP server speaking a minimal
 * EHLO dialogue — no external network. Locks in the greeting → EHLO → AUTH
 * response mapping, including the regression where the final 235 was read
 * from the wrong response index and every credentialed SMTP monitor
 * permanently reported SMTP_AUTH_FAILED.
 */

const GREETING = "220 mail.test ESMTP ready";
const EHLO_OK = "250-mail.test\r\n250 AUTH LOGIN PLAIN";
const AUTH_USER_PROMPT = "334 VXNlcm5hbWU6"; // base64 "Username:"
const AUTH_PASS_PROMPT = "334 UGFzc3dvcmQ6"; // base64 "Password:"
const AUTH_OK = "235 2.7.0 Authentication successful";

const server = Bun.listen({
  hostname: "127.0.0.1",
  port: 0,
  socket: {
    open(socket) {
      socket.write(GREETING + "\r\n");
    },
    data(socket, data) {
      const text = new TextDecoder().decode(data);
      for (const line of text.split("\r\n").filter(Boolean)) {
        let reply: string;
        if (line.startsWith("EHLO")) {
          reply = EHLO_OK;
        } else if (line === "AUTH LOGIN") {
          reply = AUTH_USER_PROMPT;
        } else if (line === btoa("probe-user")) {
          reply = AUTH_PASS_PROMPT;
        } else if (line === btoa("probe-pass")) {
          reply = AUTH_OK;
        } else if (line.startsWith("QUIT")) {
          reply = "221 bye";
        } else {
          reply = "500 unknown command";
        }
        socket.write(reply + "\r\n");
      }
    },
    error() {},
    close() {},
  },
});

afterAll(() => {
  server.stop(true);
});

describe("checkSmtp happy path (local stub server)", () => {
  test("no-auth check is UP against a normal ESMTP banner", async () => {
    const result = await checkSmtp(`smtp://127.0.0.1:${server.port}`, {
      timeoutSeconds: 3,
    });
    expect(result.status).toBe("UP");
    expect(result.banner).toContain("220");
  });

  test("credentialed AUTH LOGIN succeeds when the server accepts (regression: responses[2] read the 334 prompt instead of the 235 acceptance)", async () => {
    const result = await checkSmtp(`smtp://127.0.0.1:${server.port}`, {
      username: "probe-user",
      password: "probe-pass",
      timeoutSeconds: 3,
    });
    expect(result.status).toBe("UP");
    expect(result.errorReason).toBeUndefined();
  });

  test("bad credentials still report SMTP_AUTH_FAILED", async () => {
    const result = await checkSmtp(`smtp://127.0.0.1:${server.port}`, {
      username: "probe-user",
      password: "wrong-password",
      timeoutSeconds: 3,
    });
    expect(result.status).toBe("DOWN");
    expect(result.errorReason).toContain("SMTP_AUTH_FAILED");
  });

  test("server rejecting EHLO reports SMTP_EHLO_FAILED", async () => {
    // Refusing server: answers the greeting but rejects everything else.
    const refuse = Bun.listen({
      hostname: "127.0.0.1",
      port: 0,
      socket: {
        open(socket) {
          socket.write("220 refuse.test ESMTP\r\n");
        },
        data(socket, data) {
          const text = new TextDecoder().decode(data);
          for (const _ of text.split("\r\n").filter(Boolean)) {
            socket.write("502 command not implemented\r\n");
          }
        },
        error() {},
        close() {},
      },
    });
    try {
      const result = await checkSmtp(`smtp://127.0.0.1:${refuse.port}`, {
        timeoutSeconds: 3,
      });
      expect(result.status).toBe("DOWN");
      expect(result.errorReason).toContain("SMTP_EHLO_FAILED");
    } finally {
      refuse.stop(true);
    }
  });
});
