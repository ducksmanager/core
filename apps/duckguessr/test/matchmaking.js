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

Scenario('Create match between multiple users and start game', async ({ I }) => {
  const url = await createMatch(I)
  for (let i = 0; i < 2; i++) {
    await session(`user ${i}`, () => {
      joinMatch(I, url)
    })
  }
  I.click('.btn-success')
  I.amOnPage(url.replace('matchmaking', 'game'))
})
