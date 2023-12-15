import cookieParser from "cookie-parser";
import csrf from "csurf";
import bodyParser from "body-parser";

const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "Strict",
  },
});

const parseForm = bodyParser.urlencoded({ extended: false });

const csrfMiddleware = (app) => {
  app.use(cookieParser());
  app.use(parseForm);
  app.use(csrfProtection);
};

export default csrfMiddleware;
