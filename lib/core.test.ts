import { describe, it, expect } from "vitest";
import { verifyTurnstile, honeypotFilled, TURNSTILE_DUMMY_TOKEN } from "./turnstile";
import { formatGatheringTime, countdownLabel, nextSundayService, icsFor } from "./time";
import { amountToMinor, parseOfferingAmount, formatMoney } from "./money";
import { socialGuards, captionTooLong } from "./social";
import { totpCode, verifyTotp, newTotpSecret, hashPassword, checkPassword } from "./auth";

describe("turnstile", () => {
  it("refuses a missing token", async () => {
    expect(await verifyTurnstile(null)).toBe(false);
    expect(await verifyTurnstile("")).toBe(false);
  });
  it("refuses a fake token", async () => {
    expect(await verifyTurnstile("fake-token-123")).toBe(false);
  });
  it("passes Cloudflare's dummy token with the test secret", async () => {
    expect(await verifyTurnstile(TURNSTILE_DUMMY_TOKEN)).toBe(true);
  });
  it("honeypot catches a filled hidden field", () => {
    const fd = new FormData();
    fd.set("website", "http://spam.example");
    expect(honeypotFilled(fd)).toBe(true);
    const clean = new FormData();
    expect(honeypotFilled(clean)).toBe(false);
  });
});

describe("visitor times", () => {
  it("shows Lagos time with New York underneath", () => {
    const { local, ny } = formatGatheringTime("2026-11-22T10:30:00-05:00", "Africa/Lagos");
    expect(local).toContain("Lagos");
    expect(local).toContain("4:30"); // 10:30 New York = 16:30 Lagos
    expect(ny).toContain("New York");
  });
  it("shows only New York time for a New York visitor", () => {
    const { local, ny } = formatGatheringTime("2026-11-22T10:30:00-05:00", "America/New_York");
    expect(local).toContain("New York");
    expect(ny).toBeNull();
  });
  it("countdown says happening now during the service", () => {
    const target = new Date("2026-11-22T10:30:00-05:00");
    expect(countdownLabel(target, new Date("2026-11-22T11:00:00-05:00"))).toBe("happening now");
    expect(countdownLabel(target, new Date("2026-11-20T10:30:00-05:00"))).toContain("in 2 days");
  });
  it("next Sunday is a Sunday at 10:30 New York", () => {
    const next = nextSundayService(new Date("2026-11-20T12:00:00-05:00"));
    expect(next.getDay()).toBe(0);
  });
  it("ics output is a valid calendar", () => {
    const ics = icsFor("Bible study", "2026-11-25T19:00:00-05:00", "2026-11-25T20:00:00-05:00", "6400B Frederick Road");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:Bible study");
    expect(ics).toContain("END:VCALENDAR");
  });
});

describe("offering amounts", () => {
  it("converts dollars to cents", () => {
    expect(amountToMinor(50, "USD")).toBe(5000);
    expect(amountToMinor(50, "JPY")).toBe(50);
  });
  it("rejects amounts below $0.50", () => {
    expect(parseOfferingAmount("0.10").ok).toBe(false);
    expect(parseOfferingAmount("abc").ok).toBe(false);
    expect(parseOfferingAmount("25").ok).toBe(true);
  });
  it("formats money", () => {
    expect(formatMoney(5000, "USD")).toBe("$50.00");
  });
});

describe("social guards", () => {
  it("YouTube needs a video", () => {
    expect(socialGuards(["youtube"], "photo")).toMatch(/video/);
    expect(socialGuards(["youtube"], "video")).toBeNull();
  });
  it("Instagram needs media", () => {
    expect(socialGuards(["instagram"], "none")).toMatch(/Instagram/);
    expect(socialGuards(["instagram"], "photo")).toBeNull();
  });
  it("caption over 2,200 characters is too long", () => {
    expect(captionTooLong("x".repeat(2201))).toBe(true);
    expect(captionTooLong("hello")).toBe(false);
  });
});

describe("auth", () => {
  it("password hashing round-trips", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(checkPassword("correct horse battery staple", hash)).toBe(true);
    expect(checkPassword("wrong", hash)).toBe(false);
  });
  it("TOTP codes are 6 digits and stable within a step", () => {
    const secret = newTotpSecret();
    const at = 1_700_000_000_000;
    expect(totpCode(secret, at)).toMatch(/^\d{6}$/);
    expect(totpCode(secret, at)).toBe(totpCode(secret, at + 1000));
    expect(totpCode(secret, at)).not.toBe(totpCode(secret, at + 31_000));
  });
  it("verifies a fresh TOTP code", () => {
    const secret = newTotpSecret();
    expect(verifyTotp(secret, totpCode(secret))).toBe(true);
    expect(verifyTotp(secret, "000000")).toBe(false);
  });
});
