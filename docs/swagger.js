import swaggerAutogen from "swagger-autogen";

const doc={
    info:{
        title: 'MyAPI',
        description:"Description"
    },
    host:'localhost:8000'
}

const outputfile= './swagger-output.json'
const routes=['../src/app.js' ,'../src/routes/user.routes.js']

swaggerAutogen()(outputfile,routes,doc)