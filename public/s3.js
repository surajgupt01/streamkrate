const { S3Client, GetObjectCommand , PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path')
const fs = require('fs')

const downloadPath = path.join(__dirname , '/downloads/demo1.png')

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIA4NUM7JGVTEBNS443',
    secretAccessKey: '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',
  },
});


async function putObj(filename , contentType){
    const command = new PutObjectCommand({
     Bucket : "suraj-private",
     Key : filename,
     ContentType : contentType
    })
    const url = await getSignedUrl(s3Client,command,{ expiresIn: 3600 });
    return url
 }
 
 async function print() {
//    try {
//      const url = await getImageUrl('Screenshot 2023-06-03 143606.png');
//      console.log('url =', url);
//    } catch (error) {
//      console.error('Error generating signed URL:', error);
//    }
   console.log('url for uploading ' , await putObj(`${file.originalname}_${Date.now()}` , file.mimetype))
 }
 
 print();


 const Aws = require('aws-sdk')

 Aws.config.update({

  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIA4NUM7JGVTEBNS443',
    secretAccessKey: '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',
  },

 })

 module.exports = {Aws}
