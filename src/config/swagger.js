const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Comic Store API',
      version: '1.0.0',
      description: 'API Documentation for Comic Store',
      contact: {
        name: 'API Support',
        email: 'support@comicstore.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Authentication',
        description: 'API endpoints for user authentication'
      },
      {
        name: 'Categories',
        description: 'API endpoints for managing categories'
      },
      {
        name: 'Comics',
        description: 'API endpoints for managing comics'
      },
      {
        name: 'ComicDetails',
        description: 'API endpoints for managing comic details'
      },
      {
        name: 'Cart',
        description: 'API endpoints for managing shopping cart'
      },
      {
        name: 'Orders',
        description: 'API endpoints for managing orders'
      },
      {
        name: 'Shipping Addresses',
        description: 'API endpoints for managing shipping addresses'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = (app) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger docs available at /api-docs');
};

module.exports = { swaggerDocs };