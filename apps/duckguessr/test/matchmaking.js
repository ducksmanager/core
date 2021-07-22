Feature('matchmaking')

function join(I, username) {
  I.amOnPage('/')
  I.fillField('Username', username)
  I.click('OK')
}

async function joinMultiple(I, usernames) {
  for (const sessionName of usernames) {
    await session(sessionName, () => {
      join(I, sessionName)
    })
  }
}

Scenario('Create match between multiple users', async ({ I }) => {
  const seeAllUsernames = (I, allUsernames) => {
    for (const username of allUsernames) {
      I.seeElement(`//div[contains(., "${username}")]`)
    }
  }

  const mainUsername = 'user1'
  const otherUsernames = ['user2', 'user3']
  const allUsernames = [mainUsername, ...otherUsernames]
  join(I, mainUsername)
  await joinMultiple(I, otherUsernames)

  seeAllUsernames(I, allUsernames)
  for (const sessionName of otherUsernames) {
    await session(sessionName, () => {
      seeAllUsernames(I, allUsernames)
    })
  }
})

Scenario('Create match between multiple users and start game', ({ I }) => {
  const mainUsername = 'user1'
  const otherUsernames = ['user2', 'user3', 'user4']
  join(I, mainUsername)
  joinMultiple(I, otherUsernames)
})
