[build]
  functions = "netlify/functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
