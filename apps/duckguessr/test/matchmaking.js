Feature('matchmaking')

async function createMatch(I) {
  I.amOnPage('/')
  I.click('.card-title')
  I.seeElement('.card.player')
  return await I.grabCurrentUrl()
}

function joinMatch(I, page) {
  I.amOnPage(page)
  I.seeElement('.card.player')
}

Scenario('Create match between multiple users and start game', ({ I }) => {
  const possibleAuthors = 9
  const extraPlayers = 2
  session('match-creator', async () => {
    const url = await createMatch(I)
    for (let i = 0; i < extraPlayers; i++) {
      session(`user ${i}`, () => {
        joinMatch(I, url)
      })
    }
    I.click('.btn-success')
    I.amOnPage(url.replace('matchmaking', 'game'))
    I.waitForElement('#author-list .author.selectable', 15)
    for (let i = 0; i < extraPlayers; i++) {
      await session(`user ${i}`, () => {
        I.click(
          `#author-list .author:nth-child(${Math.floor(Math.random() * possibleAuthors + 1)})`
        )
      })
    }
  })
})
