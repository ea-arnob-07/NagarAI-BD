import assert from "node:assert/strict";
import test from "node:test";

test("renders the NagarAI civic intelligence shell", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>NagarAI BD · Civic complaint intelligence<\/title>/i);
  assert.match(html, /NAGAR<span>AI<\/span>/i);
  assert.match(html, />Analyse<\/button>/i);
  assert.match(html, /MODEL<br\s*\/>ENSEMBLE/i);
  assert.match(html, />বাংলা<\/button>/i);
  assert.match(html, />English<\/button>/i);
  assert.doesNotMatch(html, /Local demo ready/i);
  assert.doesNotMatch(html, />DEMO<\//i);
  assert.match(html, /Developed by <strong>Team EvolutionX<\/strong>/i);
  assert.match(html, /<span>Estiuk Arafat Arnob \(Team Lead\)<\/span>/i);
  assert.match(html, /<span>Md\. Riyad Hasan<\/span>/i);
  assert.match(html, /<span>Abubakkar Siddik<\/span>/i);
});
