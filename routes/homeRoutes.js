import Router from 'express'

const router = Router();
// routes

/**
 * @swagger
 * /api/v1/home:
 *   get:
 *     summary: Home route
 *     description: The home route for v1
 *     responses:
 *       200:
 *         description: Hello World
 */


router.get('/', function (req, res) {
    res.send('Hello World')
  })



export default router;