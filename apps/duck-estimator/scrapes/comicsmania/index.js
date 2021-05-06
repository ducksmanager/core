const {createQuotations, isInducksIssueExisting} = require('../../coa')

const {firefox} = require('playwright')
const REGEX_ISSUENUMBER = /^(?:ΤΕΥΧΟΣ:|\n)?[-\d]+\b(?! ?€)/s
const REGEX_PRICE = /[\d,]+(?= ?€)/s
const publicationsWithIssues = []
const quotations = []

const publicationCodesAndSections = [
  {
    publicationcode: 'gr/MM',
    sectionTitle: 'MΙΚΥ ΜΑΟΥΣ'
  },
  {
    publicationcode: 'gr/MM',
    sectionTitle: 'ΜΙΚΥ - ΔΙΠΛΑ  - ΤΡΙΠΛΑ ΤΕΥΧΗ'
  },
  {
    publicationcode: 'gr/MMB',
    sectionTitle: 'ΜΙΚΥ ΜΑΟΥΣ (ΝΕΑ ΠΕΡΙΟΔΟΣ)'
  },
  {
    publicationcode: 'gr/KL',
    sectionTitle: 'ΚΛΑΣΙΚΑ DISNEY - ΣΟΥΠΕΡ ΜΙΚΥ'
  },
  {
    publicationcode: 'gr/SM',
    sectionTitle: 'ΣΟΥΠΕΡ ΜΙΚΥ'
  },
  {
    publicationcode: 'gr/SMB',
    sectionTitle: 'ΣΟΥΠΕΡ ΜΙΚΥ. ΝΕΑ ΠΕΡΙΟΔΟΣ'
  },
  {
    publicationcode: 'gr/MIK',
    sectionTitle: 'ΜΗΝΙΑΙΟ ΜΙΚΥ ΜΑΟΥΣ'
  },
  {
    publicationcode: 'gr/MK',
    sectionTitle: 'ΜΕΓΑΛΑ ΚΛΑΣΙΚΑ - ΑΛΜΠΟΥΜ (ΔΡΑΓΟΥΝΗΣ)'
  },
  {
    publicationcode: 'gr/MMV',
    sectionTitle: 'ΤΑ ΜΙΚΡΑ ΜΕΓΑΛΑ ΒΙΒΛΙΑ (ΕΚΔ. ΚΑΜΠΑΝΑΣ)'
  },
  {
    publicationcode: 'gr/KVD',
    sectionTitle: 'EDITOR CHOICE (ΚΑΘΗΜΕΡΙΝΗ) - Η ΟΙΚΟΝΟΜΙΑ ΤΟΥ ΣΚΡΟΥΤΖ'
  },
  {
    publicationcode: 'gr/MS',
    sectionTitle: 'ΜΕΓΑΛΑ ΣΗΡΙΑΛ'
  },
  {
    publicationcode: 'gr/KX',
    sectionTitle: 'ΣΥΛΛΕΚΤΙΚΑ ΚΟΜΙΚΣ'
  },
  {
    publicationcode: 'gr/MID',
    sectionTitle: 'ΤΑ ΑΠΑΝΤΑ ΤΟΥ ΡΟΜΑΝΟ ΣΚΑΡΠΑ'
  },
  {
    publicationcode: 'gr/KXB',
    sectionTitle: 'ΣΥΛΛΕΚΤΙΚΑ ΚΟΜΙΚΣ (ΝΕΑ ΠΕΡΙΟΔΟΣ)'
  },
  {
    publicationcode: 'gr/MY',
    sectionTitle: 'ΜΙΚΥ ΜΥΣΤΗΡΙΟ (Α ΄ ΚΥΚΛΟΣ) Α\'  ΕΚΔΟΣΗ ΣΕ ΔΡΧ.'
  },
  {
    publicationcode: 'gr/MYE',
    sectionTitle: 'ΜΙΚΥ ΜΥΣΤΗΡΙΟ (Α ΄ ΚΥΚΛΟΣ) Β΄ ΕΚΔΟΣΗ ΣΕ ΕΥΡΩ'
  },
  {
    publicationcode: 'gr/MYC',
    sectionTitle: 'ΜΜ (ΜΙΚΥ ΜΥΣΤΗΡΙΟ Β΄ ΚΥΚΛΟΣ) ΜΕΓΑΛΟ ΣΧΗΜΑ - ΜΙΚΡΟ ΣΧΗΜΑ',
    issueCellRegex: /(?<!\(ΜΙΚΡΟ ΣΧΗΜΑ\))$/
  },
  {
    publicationcode: 'gr/FEST',
    sectionTitle: 'ΦΕΣΤΙΒΑΛ -18'
  },
  {
    publicationcode: 'gr/XIN',
    sectionTitle: 'ΤΣΙΠ ΚΑΙ ΝΤΑΙΗΛ'
  },
  {
    publicationcode: 'gr/XIN',
    sectionTitle: 'ΧΑΡΟΥΜΕΝΕΣ ΙΣΤΟΡΙΕΣ DISNEY'
  },
  {
    publicationcode: 'gr/VMEB',
    sectionTitle: 'ΤΟ ΒΙΒΛΙΟ ΤΩΝ ΜΙΚΡΩΝ ΕΞΕΡΕΥΝΗΤΩΝ (ΤΕΥΧΗ)'
  },
  {
    publicationcode: 'gr/VMEBE',
    sectionTitle: 'ΤΟ ΒΙΒΛΙΟ ΤΩΝ ΜΙΚΡΩΝ ΕΞΕΡΕΥΝΗΤΩΝ (ΤΟΜΟΙ)'
  },
  {
    publicationcode: 'gr/PT',
    sectionTitle: 'ΠΑΣΑΤΕΜΠΟΣ'
  },
  {
    publicationcode: 'gr/PMM',
    sectionTitle: 'ΤΟ ΠΕΡΙΟΔΙΚΟ ΤΟΥ ΜΙΚΥ ΜΑΟΥΣ (ΠΕΧΛΙΒΑΝΙΔΗΣ) - 1961'
  },
  {
    publicationcode: 'gr/NPFN',
    sectionTitle: 'ΟΙ ΝΕΕΣ ΠΕΡΙΠΕΤΕΙΕΣ ΤΟΥ ΦΑΝΤΟΜ ΝΤΑΚ (ΜΙΚΡΟ ΜΕΓΑΛΟ ΣΧΗΜΑ)'
  },
  {
    publicationcode: 'gr/DC',
    sectionTitle: 'DISNEY CINEMA ΟΙ ΚΑΛΥΤΕΡΕΣ ΤΑΙΝΙΕΣ DISNEY ΣΕ ΚΟΜΙΚΣ'
  },
  {
    publicationcode: 'gr/NT',
    sectionTitle: 'ΝΤΟΝΑΛΝΤ - 190'
  },
  {
    publicationcode: 'gr/NTB',
    sectionTitle: 'ΝΤΟΝΑΛΝΤ (ΝΕΑ ΠΕΡΙΟΔΟΣ)'
  },
  {
    publicationcode: 'gr/MIN',
    sectionTitle: 'ΜΙΝΝΙ'
  },
  {
    publicationcode: 'gr/MIN',
    sectionTitle: 'ΜΙΝΝΙ -  ΧΡΥΣΗ ΕΚΔΟΣΗ'
  },
  {
    publicationcode: 'gr/ALM',
    sectionTitle: 'ΑΛΜΑΝΑΚΟ - ΦΑΝΤΟΜ ΝΤΑΚ'
  },
  {
    publicationcode: 'gr/SALM',
    sectionTitle: 'ΣΟΥΠΕΡ ΑΛΜΑΝΑΚΟ'
  },
  {
    publicationcode: 'gr/ALM',
    sectionTitle: 'ΑΛΜΑΝΑΚΟ (257)'
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
  },
  {
    publicationcode: null,
    sectionTitle: 'ΜΙΚΥ - ΣΠΟΡ'
  }
]

module.exports = {
  async scrape() {
    const browser = await firefox.launch()
    const page = await browser.newPage()
    await page.goto('http://comicsmania.gr/pages/01_mikimaous.htm')

    const pageLinks = await page.$$('css=a')
    let pageNumber = 0
    for (const pageLink of pageLinks) {
      console.log (`Page ${++pageNumber}`)
      const [subPage] = await Promise.all([
        page.waitForEvent('popup'),
        pageLink.click()
      ])

      let currentPublication = null

      await subPage.waitForLoadState('domcontentloaded')
      const issueCells = await subPage.$$('tr td:nth-child(odd), tr th')
      for (const issueCell of issueCells) {
        const tagName = await issueCell.evaluate(e => e.tagName)
        const cellText = await issueCell.innerText()
        if (cellText.replace(/ /g, '') === '') {
          continue
        }
        switch (tagName) {
          case 'TH': {
            const publicationSection = publicationCodesAndSections.find(({sectionTitle}) => sectionTitle.replace(/\u00a0/g, " ") === cellText)
            if (publicationSection) {
              currentPublication = publicationSection
              console.info(`Section found for ${currentPublication.publicationcode} : ${cellText}`)
            }
            continue
          }
          case 'TD':
            if (!currentPublication) {
              console.error(`No current publication found in page for issue number ${cellText}`)
              continue
            }
            if (!currentPublication.publicationcode) {
              continue
            }
        }
        if (!cellText) {
          continue
        }
        const issueTextMatch = cellText.match(REGEX_ISSUENUMBER)
        if (!issueTextMatch || (currentPublication.issueCellRegex && !currentPublication.issueCellRegex.test(cellText))) {
          continue
        }
        let issuenumber = issueTextMatch[0].replace('ΤΕΥΧΟΣ:', '');
        let issuenumberParts = issuenumber.split(/[-/]/)
        if (issuenumberParts.length === 2) {
          issuenumberParts = issuenumberParts.map(part => parseInt(part))
          if (issuenumberParts[0] === issuenumberParts[1] - 1) {
            issuenumber = `${issuenumberParts[0]}-${String(issuenumberParts[1]).substring(2)}`
          }
        }

        try {
          let priceMatch = cellText.match(REGEX_PRICE)
          if (!priceMatch) {
            const priceCell = await issueCell.waitForSelector('xpath=..//..//tr//td[contains(.,"τεύχος")]|following-sibling::td', {timeout: 100})
            const priceText = await priceCell.innerText()
            priceMatch = priceText.match(REGEX_PRICE)
          }

          if (!priceMatch) {
            continue
          }
          publicationsWithIssues.push(currentPublication)
          const {publicationcode: currentPublicationCode} = currentPublication
          if (await isInducksIssueExisting(currentPublicationCode, issuenumber)) {
            const price = parseFloat(priceMatch[0].replace(',', '.'));
            quotations.push({
              publicationcode: currentPublicationCode,
              issuenumber,
              estimationMin: price,
              estimationMax: null,
              scrapeDate: null
            })
            console.log(`Found ${currentPublicationCode} ${issuenumber}`)
          }
        } catch (_) {
        }
      }
    }
    await browser.close()
    const sectionsNotFound = publicationCodesAndSections
      .filter(({sectionTitle}) =>
        !publicationsWithIssues.some(({sectionTitle: foundSectionTitle}) => foundSectionTitle === sectionTitle)
      )
    for (const {sectionTitle} of sectionsNotFound) {
      console.log('Section not found: ' + sectionTitle)
    }
    await createQuotations(quotations)
  }
}
