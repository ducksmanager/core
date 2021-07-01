Feature('matchmaking')

function join(I: CodeceptJS.I, username: string) {
  I.amOnPage('/')
  I.fillField('Username', username)
  I.click('OK')
}

function joinMultiple(I: CodeceptJS.I, usernames: string[]) {
  for (const sessionName of usernames) {
    session(sessionName, () => {
      join(I, sessionName)
    })
  }
}

Scenario('Create match between multiple users', ({ I }) => {
  const seeAllUsernames = (I: CodeceptJS.I, allUsernames: string[]) => {
    for (const username of allUsernames) {
      I.seeElement(`//div[contains(., "${username}")]`)
    }
  }

  const mainUsername = 'user1'
  const otherUsernames = ['user2', 'user3']
  const allUsernames = [mainUsername, ...otherUsernames]
  join(I, mainUsername)
  joinMultiple(I, otherUsernames)

  seeAllUsernames(I, allUsernames)
  for (const sessionName of otherUsernames) {
    session(sessionName, () => {
      seeAllUsernames(I, allUsernames)
    })
  }
})

Scenario('Create match between multiple users and start game', ({ I }) => {
  const mainUsername = 'user1'
  const otherUsernames = ['user2', 'user3', 'user4']
  join(I, mainUsername)
  joinMultiple(I, otherUsernames)

  pause()
})
