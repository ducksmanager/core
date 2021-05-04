const {createQuotation, isInducksIssueExisting} = require('../../coa')

const {firefox} = require('playwright')
const REGEX_ISSUENUMBER = /^\d+\b/s
const REGEX_PRICE = /[\d]+(?= ?€)/s
const prices = {}

const publicationCodesAndSections = [
  {
    publicationcode: 'gr/MM',
    sectionTitle: 'MΙΚΥ ΜΑΟΥΣ'
  },
  {
    publicationcode: 'gr/MMB',
    sectionTitle: 'ΜΙΚΥ ΜΑΟΥΣ (ΝΕΑ ΠΕΡΙΟΔΟΣ)'
  }
]

module.exports = {
  async scrape() {
    const browser = await firefox.launch()
    const page = await browser.newPage()
    await page.goto('http://comicsmania.gr/pages/01_mikimaous.htm')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('css=a')
    ])

    let currentPublicationCode = null

    await page1.waitForLoadState('domcontentloaded')
    const issueCells = await page1.$$('tr td:nth-child(odd), tr th')
    for (const issueCell of issueCells) {
      const tagName = await issueCell.evaluate(e => e.tagName)
      const cellText = await issueCell.innerText()
      switch (tagName) {
        case 'TH': {
          if (prices[currentPublicationCode] && !Object.keys(prices[currentPublicationCode]).length) {
            continue
          }
          const publicationSection = publicationCodesAndSections.find(({sectionTitle}) => sectionTitle === cellText)
          if (publicationSection) {
            currentPublicationCode = publicationSection.publicationcode
            prices[currentPublicationCode] = {}
            continue
          } else {
            console.warn(`No Inducks publication for ${cellText}`)
          }
        }
        break;
        case 'TD':
          if (!currentPublicationCode) {
            console.error(`No current publication found in page for issue number ${cellText}`)
            continue
          }
      }
      if (!cellText) {
        continue
      }
      const issueTextMatch = cellText.match(REGEX_ISSUENUMBER)
      if (!issueTextMatch) {
        continue
      }
      const [issuenumber] = issueTextMatch;

      try {
        const priceCell = await issueCell.waitForSelector('xpath=following-sibling::td', {timeout: 100})
        const priceText = await priceCell.innerText()
        const priceMatch = priceText.match(REGEX_PRICE)
        if (!priceMatch) {
          continue
        }
        if (await isInducksIssueExisting(currentPublicationCode, issuenumber)) {
          await createQuotation(currentPublicationCode, issuenumber, priceMatch[0], null, null)
        }
      } catch (_) {}
    }
    await browser.close()
  }
}
