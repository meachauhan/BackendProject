import swaggerJsdoc from "swagger-jsdoc";
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "VideoTube Open Source API",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "chaiaurcode",
        url: "##",
      },
      contact: {
        name: "Akash Chauhan",

        email: "meachauhan@gmail.com",
      },
    },
    servers: [
      {
        url: "http://7mgnrg-8001.csb.app",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

export { specs };
