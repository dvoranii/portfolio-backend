import sanitizeHtml from "sanitize-html";

const sanitizeInput = {
  text: (input) =>
    sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
    }),
  message: (input) =>
    sanitizeHtml(input, {
      allowedTags: ["b", "i", "em", "strong", "a"],
      allowedAttributes: {
        a: ["href"],
      },
    }),
};

export default sanitizeInput;
