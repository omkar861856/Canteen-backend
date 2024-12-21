import path from 'path'
import multer from 'multer'


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images/')
    },
    filename: (req, file, cb) => {
      // const filename = `${file.fieldname}_${itemId}${path.extname(file.originalname)}`;
      cb(null, file.fieldname + Date.now() + '_' + path.extname(file.originalname))
    }
  })
  
  export const upload = multer({
    storage: storage
  })
  