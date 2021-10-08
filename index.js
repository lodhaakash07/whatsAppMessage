const puppeteer = require('puppeteer');
const config = require('./config')
const fs = require('fs')
const xlsx = require('node-xlsx')
const start = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './user_data'
  })
  const page = await browser.newPage()
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);
  await page.goto('http://web.whatsapp.com')
  await page.waitForSelector('._1RAKT', {timeout: 200000})
  
  console.log('logged in')

  let contactlist = getContact(config.contact)
  contactlist = contactlist[0]

  for (const contact of contactlist.data) {
    try{
          let precontent = getContent(config.content)
          precontent = 'Hi ' + contact[1] +', \n\n' + precontent
          let content = encodeURI(precontent)

          let phnNo = contact[0]+""
          if(phnNo.length==10) {
            phnNo = "91"+phnNo
          } else if(phnNo.length==11 && phnNo.charAt(0)=='0') {
            phnNo = phnNo.replace('0','91')
          }
          await page.goto('https://web.whatsapp.com/send?phone='+phnNo+'&text='+content)

          await page.on('dialog', async dialog => {
            await dialog.accept()
          }) 
          try {
            await page.waitForSelector('._4sWnG', {timeout: 100000})
            await page.waitFor(1000)
          } catch (error) {
            console.log('invalid phone number ' +phnNo)
            continue;
          }
          await page.waitFor(1000)
          await page.focus('._4sWnG')
          await page.keyboard.press(String.fromCharCode(13))
          console.log('success send message to '+phnNo)
        }catch(e){
          console.log(e)
        }
        await page.waitFor(3000)
  }

  console.log('done')
  await page.waitFor(1000)
  browser.close()
}

start()



const getContact = (path) => {
  const contact = xlsx.parse(path)
  return contact;
}

const getContent = (path) => {
  const content = fs.readFileSync(path, {encoding: 'utf-8'})
  return content;
}



