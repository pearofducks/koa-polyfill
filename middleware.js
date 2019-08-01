const polyfill = require('polyfill-library')

function featuresfromQueryParam(features, flags) {
  features = features.split(",");
  flags = flags ? flags.split(",") : [];

  features = features.filter(x => x.length).map(x => x.replace(/[\*\/]/g, "")); // Eliminate XSS vuln

  return features.sort().reduce((obj, feature) => {
    const [name, ...featureSpecificFlags] = feature.split("|");
    obj[name] = {
      flags: new Set(featureSpecificFlags.concat(flags))
    };
    return obj;
  }, {});
};

function getPolyfillParameters(req = {}) {
  const query = req.query || {};
  const path = req.path || "";
  const { excludes = "", features = "default", rum, unknown = "polyfill", callback } = query;
  const uaString = query.ua || (req.headers && req.headers["user-agent"]) || (typeof req.get === "function" && req.get("User-Agent")) || "";

  return {
    excludes: excludes ? excludes.split(",") : [],
    features: featuresfromQueryParam(features, query.flags),
    minify: path.endsWith(".min.js"),
    rum: Number.parseInt(rum, 10) === 1,
    stream: false,
    callback: /^[\w\.]+$/.test(callback || "") ? callback : false,
    unknown,
    uaString,
  };
};

async function getPolyfill (ctx) {
  ctx.set("Content-Type", "text/javascript; charset=utf-8")
  const params = getPolyfillParameters(ctx.request)
  const bundle = await polyfill.getPolyfillString(params)
  ctx.body = bundle
}

const listPolyfills = async (ctx) => ctx.body = await polyfill.listAliases()

module.exports = { getPolyfill, listPolyfills }
