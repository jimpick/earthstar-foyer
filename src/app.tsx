import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Earthbar } from './earthbar'
import { FoyerApp } from './apps/foyerApp'
import { HelloApp } from './apps/helloApp'
import { DebugApp } from './apps/debugApp'
import { TodoApp } from './apps/todoApp'
import delay from 'delay'

//================================================================================
// MAIN

// The "Earthbar" is the workspace and user switcher panel across the top.
// It's responsible for setting up Earthstar classes and rendering the "app".
// The "app" in this case is LobbyApp.

// DisplayText: Component
// first app listed here is the default
let apps = {
  Todos: TodoApp,
  Foyer: FoyerApp,
  'Debug View': DebugApp,
  'Hello World': HelloApp
}

ReactDOM.render(<Earthbar apps={apps} />, document.getElementById('react-slot'))

// Sandstorm keep-alive

async function keepAlive () {
  while (true) {
    console.log('Keep-alive fetch...')
    const resp = await fetch('/.keep-alive')
    await delay(1000)
  }
}
keepAlive()

// Powerbox-http-proxy

function getWebSocketUrl () {
  const protocol = window.location.protocol.replace('http', 'ws')
  return protocol + '//' + window.location.host + '/_sandstorm/websocket'
}
function connectWebSocket () {
  console.log('Connecting to websocket.')
  const socket = new WebSocket(getWebSocketUrl())
  socket.onmessage = event => {
    console.log('Got message from server: ', event.data)
    window.parent.postMessage(JSON.parse(event.data), '*')
  }
  socket.onclose = () => {
    // Short delay before re-trying, so we don't overload the server.
    // TODO: expontential backoff.
    // TODO: do something to avoid thrashing between more than one client.
    console.log('Disconnected; re-trying in 500ms')
    setTimeout(connectWebSocket, 500)
  }
  window.addEventListener('message', event => {
    if (event.source !== window.parent) {
      return
    }
    console.log('Got message parent frame: ', event.data)
    socket.send(JSON.stringify(event.data))
  })
}
connectWebSocket()
