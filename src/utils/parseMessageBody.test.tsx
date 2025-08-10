// src/utils/parseMessageBody.test.tsx
import { parseMessageBody } from "./parseMessageBody";

describe("parseMessageBody (string-only)", () => {
  it("returns body without links as-is", () => {
    const messageBody = "hello everyone this is some text";
    expect(parseMessageBody(messageBody)).toBe(messageBody);
  });

  it("returns multiline body as-is (with newlines)", () => {
    const line1 = "hello everyone,";
    const line2 = "this is a multiline";
    const line3 = "message.";
    const messageBody = `${line1}\n${line2}\n${line3}`;

    expect(parseMessageBody(messageBody)).toBe(messageBody);
  });

  it("does not convert link: leaves it as plain text", () => {
    const beforeBody = "check out this link ";
    const link = "https://www.google.com";
    const afterBody = " alright";
    const messageBody = `${beforeBody}${link}${afterBody}`;

    const rendered = parseMessageBody(messageBody);
    expect(rendered).toBe(messageBody);
  });

  it("does not add protocol for www.* here (handled elsewhere)", () => {
    const link = "www.google.com";
    expect(parseMessageBody(link)).toBe(link);
  });

  it("invalid TLD stays plain text", () => {
    const messageBody = "hello www.google.invalidtopleveldomain";
    expect(parseMessageBody(messageBody)).toBe(messageBody);
  });

  it("http without dot domain stays as-is", () => {
    const link = "http://anyrandomstring";
    expect(parseMessageBody(link)).toBe(link);
  });

  it("complex url stays as-is", () => {
    const link = "http://www.google.com/root-path/page1#hashlink%20hello?arg1=123&arg2=321";
    expect(parseMessageBody(link)).toBe(link);
  });

  it("underscored domain stays as plain text", () => {
    const messageBody = "www.go_ogle.com";
    expect(parseMessageBody(messageBody)).toBe(messageBody);
  });

  it("strips zero-width characters/BOM", () => {
    const dirty = "hello\u200Bworld\uFEFF";
    expect(parseMessageBody(dirty)).toBe("helloworld");
  });
});
