import routes from "./app.js";

const app = routes;
const port = 5000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
