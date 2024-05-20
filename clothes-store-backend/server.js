const express = require('express')
const app = express()
const cors = require('cors')
const port = 8080
const router = require('./routes')
const dotenv = require('dotenv')
const db = require('./models')
const { default: axios } = require('axios')

const swaggerUi = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')

dotenv.config()

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)

const swaggerOptions = {
  swaggerDefinition: {
    infor: {
      title: 'Clothes store',
      description: 'Clothes store',
      contact: {
        name: 'Thanh nguyen',
      },
      servers: ['http://localhost:8080'],
    },
  },
  apis: ['server.js'],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router(app)

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'YOUR-DOMAIN.TLD') // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

const init = async () => {
  const admin = await db.models.User.findOne({ where: { email: 'admin@gmail.com' } })
  if (admin === null) {
    await axios.post('http://localhost:8080/api/auth/register', {
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: '123456',
      gender: 'male',
      birthday: '1999-05-31',
      address: 'HN',
      phone: '0869609032',
      role: 'admin',
    })
  }
  const type = await db.models.Type.findAll()
  // console.log(type)
  if (type.length === 0) {
    await db.models.Type.create({
      name: 'Men',
    })
    await db.models.Type.create({
      name: 'Women',
    })
    await db.models.Type.create({
      name: 'Kids',
    })
  }
}
init()

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
