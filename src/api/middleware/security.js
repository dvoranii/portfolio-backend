export default function security(app) {
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader(
      "Content-Security-Policy",
      "script-src 'self' https://cdnjs.cloudflare.com/; img-src 'self'; frame-ancestors 'none';"
    );

    if (req.headers["user-agent"].indexOf("MSIE ") !== -1) {
      // IE workaround for frame detection
      res.write(
        "<script>if (window.top !== window.self) { window.top.location = window.self.location; }</script>"
      );
    }

    next();
  });
}
