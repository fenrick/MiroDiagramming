async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({ url: 'app.html' })
  })
  miro.board.ui.on('custom:edit-metadata', async () => {
    await miro.board.ui.openPanel({ url: 'app.html?command=edit-metadata' })
  })
}

init()
