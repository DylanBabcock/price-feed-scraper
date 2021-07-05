const axios = require('axios')//http library 
const cheerio = require('cheerio')
const express = require('express')

async function getPriceFeed(){
  try{
    const siteUrl = 'https://coinmarketcap.com/'

    const { data } = await axios({
      method: "GET",
      url: siteUrl,
    })

    const $ = cheerio.load(data)

    //<tr> tag selector
    const elemSelector = '#__next > div > div.main-content > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div > div.tableWrapper___3utdq.cmc-table-homepage-wrapper___22rL4 > table > tbody > tr'

    const keys = [//Names for the different values
      'rank',
      'name',
      'price',
      '24h',
      '7d',
      'marketCap',
      'volume',
      'circulatingSupply'

    ]

    const coinArr = []

    $(elemSelector).each((parentIdx, parentElem) =>{//targeting selector
      let keyIdx = 0
      const coinObj = {}

      if(parentIdx <= 9){// getting top 10 elements from website
        $(parentElem).children().each((childIdx, childElem) =>{//.children targets all of the <td> tags
          let tdValue = $(childElem).text()//getting text from the <td> tags

          if(keyIdx === 1 || keyIdx === 6){
              tdValue = $('p:first-child', $(childElem).html()).text()//On Name and Volume - passing html into cheerio and getting the first child

          }

          if(tdValue){
            coinObj[keys[keyIdx]] = tdValue//assigns the keys array to the proper values

            keyIdx++
          }
        })
       coinArr.push(coinObj)

      }
    })


    return coinArr
  }catch(err){
    console.error(err)
  }
}


const app = express()//express server

app.get('/api/price-feed', async (req, res) =>{
  try{
    app.set('json spaces', 40);// fix spacing
    const priceFeed = await getPriceFeed()
    return res.status(200).json({
      result: priceFeed,
    })
  }catch(err){
    return res.status(500).json({
      err: err.toString(),
    })

  }
})

app.listen(3000, () =>{//local host
  console.log("running on port 3000")
})
