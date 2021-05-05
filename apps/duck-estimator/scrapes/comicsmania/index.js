const {createQuotations, isInducksIssueExisting} = require('../../coa')

const {firefox} = require('playwright')
const REGEX_ISSUENUMBER = /^\d+\b/s
const REGEX_PRICE = /[\d,]+(?= ?€)/s
const publicationsWithIssues = []
const quotations = []

const publicationCodesAndSections = [
  {
    publicationcode: 'gr/MM',
    sectionTitle: 'MΙΚΥ ΜΑΟΥΣ'
  },
  {
    publicationcode: 'gr/MMB',
    sectionTitle: 'ΜΙΚΥ ΜΑΟΥΣ (ΝΕΑ ΠΕΡΙΟΔΟΣ)'
  },
  {
    publicationcode: null,
    sectionTitle: 'ΞΕΝΟΓΛΩΣΣΑ ΜΙΚΥ ΜΑΟΥΣ (DELL)'
  },
  {
    publicationcode: null,
    sectionTitle: 'ΜΙΚΥ ΜΑΟΥΣ ΧΑΡΤΑΚΙΑ 1950;'
  },
  {
    publicationcode: null,
    sectionTitle: 'ΧΑΡΤΑΚΙΑ DISNEY  (ΜΕΓΑΛΟ ΣΧΗΜΑ)'
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
      if (cellText.replace(/ /g, '') === '') {
        continue
      }
      switch (tagName) {
        case 'TH': {
          const publicationSection = publicationCodesAndSections.find(({sectionTitle}) => sectionTitle === cellText)
          if (publicationSection) {
            currentPublicationCode = publicationSection.publicationcode
            console.info(`Section found for ${currentPublicationCode} : ${cellText}`)
          }
          continue
        }
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
        const priceCell = await issueCell.waitForSelector('xpath=..//..//tr//td[contains(.,"τεύχος")]|following-sibling::td', {timeout: 100})
        const priceText = await priceCell.innerText()
        const priceMatch = priceText.match(REGEX_PRICE)
        if (!priceMatch) {
          continue
        }
        publicationsWithIssues.push(currentPublicationCode)
        if (await isInducksIssueExisting(currentPublicationCode, issuenumber)) {
          const price = parseFloat(priceMatch[0].replace(',', '.'));
          quotations.push({publicationcode: currentPublicationCode, issuenumber, estimationMin: price, estimationMax: null, scrapeDate: null})
          console.log(`Found ${currentPublicationCode} ${issuenumber}`)
        }
      } catch (_) {
      }
    }
    await browser.close()
    await createQuotations(quotations)
  }
}
