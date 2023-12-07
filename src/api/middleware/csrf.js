import cookieParser from "cookie-parser";
import csrf from "csurf";
import bodyParser from "body-parser";

const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

const csrfMiddleware = (app) => {
  app.use(cookieParser());
  app.use(parseForm);
  app.use(csrfProtection);
};

export default csrfMiddleware;
