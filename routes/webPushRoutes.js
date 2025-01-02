import Router from 'express'

import webPush from 'web-push'


const router = Router()


export const vapidKeys = webPush.generateVAPIDKeys();

export const webNotifications = webPush.setVapidDetails(
  'mailto:omkar861856@gmail.com',
  `${vapidKeys.publicKey}`,
  `${vapidKeys.privateKey}`
)






export default router