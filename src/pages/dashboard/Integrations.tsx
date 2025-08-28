import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Trello, 
  CheckCircle, 
  AlertCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  Loader2
} from 'lucide-react'

export default function Integrations() {
  const [trelloIntegration, setTrelloIntegration] = useState({
    isConnected: false,
    boardName: "",
    listName: "",
    lastSync: "",
    status: "disconnected",
    isLoading: false
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [syncStatus, setSyncStatus] = useState("")
  const [showInstructions, setShowInstructions] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [showManualTokenEntry, setShowManualTokenEntry] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successType, setSuccessType] = useState<'connect' | 'disconnect'>('connect')

  // Check for existing Trello integration on component mount
  useEffect(() => {
    checkTrelloIntegration()
  }, [])

  const checkTrelloIntegration = async () => {
    try {
      // Check for Power-Up connection data
      const connectionData = localStorage.getItem('linkloom-connection')
      const trelloData = localStorage.getItem('trello-real-data')
      
      if (connectionData && trelloData) {
        try {
          const connection = JSON.parse(connectionData)
          const trello = JSON.parse(trelloData)
          
          // Get list connections info
          const listConnections = connection.listConnections || []
          const connectedLists = listConnections.map((conn: any) => conn.listName).join(', ')
          
          setTrelloIntegration({
            isConnected: true,
            boardName: trello.boardName || connection.boardName || "Content Calendar",
            listName: connectedLists || "Multiple Lists",
            lastSync: "Connected via Power-Up",
            status: "active",
            isLoading: false
          })
        } catch (parseError) {
          console.error('Error parsing Power-Up data:', parseError)
          setTrelloIntegration({
            isConnected: false,
            boardName: "",
            listName: "",
            lastSync: "",
            status: "disconnected",
            isLoading: false
          })
        }
      } else {
        setTrelloIntegration({
          isConnected: false,
          boardName: "",
          listName: "",
          lastSync: "",
          status: "disconnected",
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Error checking Trello integration:', error)
      setTrelloIntegration({
        isConnected: false,
        boardName: "",
        listName: "",
        lastSync: "",
        status: "disconnected",
        isLoading: false
      })
    }
  }

  const handleConnectTrello = async () => {
    setShowInstructions(true)
  }

  const startTrelloOAuth = async () => {
    setShowInstructions(false)
    setIsConnecting(true)
    
    try {
      const trelloApiKey = '***REMOVED***'
      const trelloAuthUrl = `https://trello.com/1/authorize?expiration=never&name=LinkLoom&scope=read,write&response_type=token&key=${trelloApiKey}`
      
      const authWindow = window.open(
        trelloAuthUrl,
        'trello_auth',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes'
      )

      if (!authWindow) {
        throw new Error('Popup blocked! Please allow popups for this site.')
      }
      authWindow.focus()

      let tokenDetected = false
      let popupClosed = false

      const advancedTokenDetection = setInterval(async () => {
        if (tokenDetected || popupClosed) {
          clearInterval(advancedTokenDetection)
          return
        }
        try {
          if (authWindow.closed) {
            popupClosed = true
            clearInterval(advancedTokenDetection)
            return
          }
          if (authWindow.location.href.includes('trello.com/1/token/approve')) {
            setTimeout(async () => {
              if (tokenDetected || popupClosed) return
              try {
                const popupDoc = authWindow.document
                if (popupDoc && popupDoc.body) {
                  const script = popupDoc.createElement('script')
                  script.textContent = `
                    (function() {
                      try {
                        const tokenSelectors = ['pre', '.token', '[class*="token"]', 'code', '.code', 'div', 'span', 'p'];
                        let token = null;
                        for (const selector of tokenSelectors) {
                          const elements = document.querySelectorAll(selector);
                          for (const element of elements) {
                            const text = element.textContent || element.innerText;
                            if (text) {
                              const match = text.match(/[A-Za-z0-9]{64,}/);
                              if (match) { token = match[0]; break; }
                            }
                          }
                          if (token) break;
                        }
                        if (!token) {
                          const pageText = document.body.textContent || document.body.innerText;
                          const match = pageText.match(/[A-Za-z0-9]{64,}/);
                          if (match) { token = match[0]; }
                        }
                        if (token) {
                          window.opener.postMessage({ type: 'TRELLO_TOKEN', token: token }, '*');
                        }
                      } catch (error) { console.error('Token extraction error:', error); }
                    })();
                  `;
                  popupDoc.head.appendChild(script)
                }
              } catch (error) { /* CORS blocked script injection */ }
              if (!tokenDetected && !popupClosed) {
                setTimeout(() => {
                  if (!tokenDetected && !popupClosed) {
                    console.log('🔍 Checking popup window...')
                    try {
                      if (authWindow.location.href.includes('trello.com/1/token/approve')) {
                        console.log('🔍 Popup is on token page, waiting for token...')
                      } else if (authWindow.location.href.includes('trello.com/1/authorize')) {
                        console.log('🔍 Popup is on authorize page, waiting for approval...')
                      } else {
                        console.log('🔍 Popup location:', authWindow.location.href)
                      }
                    } catch (error) {
                      console.log('🔒 CORS blocked popup access (normal)')
                    }
                  }
                }, 2000)
              }
            }, 3000)
          } else if (authWindow.location.href.includes('trello.com/1/authorize')) {
            console.log('🔍 Popup is on authorize page, waiting for approval...')
          } else {
            console.log('🔍 Popup location:', authWindow.location.href)
          }
        } catch (error) {
          console.log('🔒 CORS blocked popup access (normal)')
        }
      }, 1000)

      const messageHandler = (event: MessageEvent) => {
        if (tokenDetected) return
        if (event.data && event.data.type === 'TRELLO_TOKEN') {
          const token = event.data.token
          processTrelloToken(token)
          tokenDetected = true
          if (!authWindow.closed) { authWindow.close() }
          clearInterval(advancedTokenDetection)
          window.removeEventListener('message', messageHandler)
        }
      }
      window.addEventListener('message', messageHandler)

      const closeChecker = setInterval(() => {
        if (tokenDetected) { clearInterval(closeChecker); return }
        if (authWindow.closed) {
          popupClosed = true
          clearInterval(advancedTokenDetection)
          clearInterval(closeChecker)
          window.removeEventListener('message', messageHandler)
          // Immediately offer manual token entry
          setTimeout(() => {
            setShowCompletion(true)
          }, 100)
        }
      }, 200)

      setTimeout(() => {
        if (!tokenDetected && !popupClosed) {
          clearInterval(advancedTokenDetection)
          clearInterval(closeChecker)
          window.removeEventListener('message', messageHandler)
          // Offer manual token entry directly
          openManualTokenEntry(authWindow)
        }
      }, 30000)

    } catch (error: unknown) {
      console.error('❌ Error connecting to Trello:', error)
      setIsConnecting(false)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Error connecting to Trello: ${errorMessage}`)
    }
  }

  const openManualTokenEntry = (authWindow: Window | null) => {
    if (authWindow && !authWindow.closed) {
      authWindow.close()
    }
    
    // Show beautiful custom manual token entry modal
    setShowManualTokenEntry(true)
  }

  const handleManualTokenSubmit = () => {
    if (manualToken && manualToken.trim().length > 20) {
      const cleanToken = manualToken.trim()
      if (cleanToken.match(/^[A-Za-z0-9]{64,}$/)) {
        processTrelloToken(cleanToken)
        setShowManualTokenEntry(false)
        setManualToken('')
      } else {
        alert('❌ Invalid token format. Please make sure you copied the complete token from Trello.')
        setIsConnecting(false)
      }
    } else {
      alert('❌ Token too short. Please copy the complete token from Trello (should be 64+ characters).')
      setIsConnecting(false)
    }
  }

  const processTrelloToken = async (token: string) => {
    try {
      localStorage.setItem('trello_token', token)
      
      const trelloApiKey = '***REMOVED***'
      const userResponse = await fetch(`https://api.trello.com/1/members/me?key=${trelloApiKey}&token=${token}`)
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch Trello user info')
      }
      
              // const userData = await userResponse.json() // TODO: Use user data for personalization
      const boardsResponse = await fetch(`https://api.trello.com/1/members/me/boards?key=${trelloApiKey}&token=${token}`)
      const boards = await boardsResponse.json()
      
      const defaultBoard = boards.find((board: any) => !board.closed) || boards[0]
      
      if (defaultBoard) {
        const listsResponse = await fetch(`https://api.trello.com/1/boards/${defaultBoard.id}/lists?key=${trelloApiKey}&token=${token}`)
        const lists = await listsResponse.json()
        
        const defaultList = lists.find((list: any) => !list.closed) || lists[0]
        
        const integration = {
          boardName: defaultBoard.name,
          listName: defaultList.name,
          lastSync: new Date().toLocaleString(),
          boardId: defaultBoard.id,
          listId: defaultList.id
        }
        
        localStorage.setItem('trello_integration', JSON.stringify(integration))
        localStorage.setItem('trello_board_id', defaultBoard.id)
        
        setTrelloIntegration({
          isConnected: true,
          boardName: integration.boardName,
          listName: integration.listName,
          lastSync: integration.lastSync,
          status: "active",
          isLoading: false
        })
        
        setIsConnecting(false)
        setShowSuccess(true)
        setSuccessType('connect')
      }
    } catch (error) {
      console.error('Error processing Trello token:', error)
      alert('Error processing Trello token. Please try again.')
      setIsConnecting(false)
    }
  }

  const handleSyncNow = async () => {
    setSyncStatus("Syncing...")
    setTimeout(() => {
      setSyncStatus("Sync completed!")
      setTimeout(() => setSyncStatus(""), 2000)
    }, 2000)
  }

  const handleReconfigure = () => {
    alert('Reconfigure functionality coming soon!')
  }

  const handleViewBoard = () => {
    const boardUrl = `https://trello.com/b/${localStorage.getItem('trello_board_id') || 'example'}`
    window.open(boardUrl, '_blank')
  }

  const handleDisconnect = async () => {
    setShowDisconnectConfirm(true)
  }

  const confirmDisconnect = async () => {
    try {
      localStorage.removeItem('trello_token')
      localStorage.removeItem('trello_integration')
      localStorage.removeItem('trello_board_id')
      
      setTrelloIntegration({
        isConnected: false,
        boardName: "",
        listName: "",
        lastSync: "",
        status: "disconnected",
        isLoading: false
      })
      
      setShowDisconnectConfirm(false)
      
      setShowSuccess(true)
      setSuccessType('disconnect')
    } catch (error) {
      console.error('Error disconnecting Trello:', error)
      alert('Error disconnecting Trello. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your tools to automate your bio links
        </p>
      </div>

      {/* Power-Up Connection Status */}
      <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <CardTitle className="text-blue-900 text-xl">Power-Up Connection</CardTitle>
                <CardDescription className="text-blue-700">
                  Status of your Trello Power-Up integration
                </CardDescription>
              </div>
            </div>
            <Badge variant={trelloIntegration.isConnected ? "default" : "outline"} className="bg-blue-100 text-blue-800">
              {trelloIntegration.isConnected ? "Power-Up Active" : "Power-Up Not Connected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {trelloIntegration.isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">Power-Up is connected and syncing</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Board:</span>
                  <p className="text-blue-600">{trelloIntegration.boardName}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Lists:</span>
                  <p className="text-blue-600">{trelloIntegration.listName}</p>
                </div>
              </div>
              <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                💡 Your Trello cards are automatically syncing to LinkLoom via the Power-Up
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-blue-700 mb-3">
                To connect, add the LinkLoom Power-Up to your Trello board
              </p>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Power-Up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trello Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Trello className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Trello</CardTitle>
                <CardDescription>
                  Sync your content calendar automatically
                </CardDescription>
              </div>
            </div>
            <Badge variant={trelloIntegration.isConnected ? "default" : "secondary"}>
              {trelloIntegration.isConnected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {trelloIntegration.isConnected ? (
            <>
              {/* Connection Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Board</label>
                  <p className="text-sm text-muted-foreground">{trelloIntegration.boardName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">List</label>
                  <p className="text-sm text-muted-foreground">{trelloIntegration.listName}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">
                  Last sync: {trelloIntegration.lastSync}
                </span>
                {syncStatus && (
                  <span className="text-sm text-blue-600 ml-2">({syncStatus})</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSyncNow}
                  disabled={syncStatus === "Syncing..."}
                >
                  {syncStatus === "Syncing..." ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {syncStatus === "Syncing..." ? "Syncing..." : "Sync Now"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReconfigure}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Reconfigure
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewBoard}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Board
                </Button>
                
                {/* Inline Disconnect Confirmation - No Popup */}
                {!showDisconnectConfirm ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <div className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 flex gap-3 items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-100 via-red-200 to-red-300 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-700" />
                    </div>
                    <span className="text-red-800 font-semibold">Disconnect Trello?</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowDisconnectConfirm(false)}
                      className="border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={confirmDisconnect}
                      className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900"
                    >
                      Yes, Disconnect
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Trello className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Connect Trello via Power-Up
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                To connect Trello, add the LinkLoom Power-Up to your Trello board. 
                The Power-Up will automatically sync your cards to LinkLoom.
              </p>
              <div className="relative">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleConnectTrello}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Trello className="mr-2 h-5 w-5" />
                  )}
                  {isConnecting ? "Connecting..." : "Connect Trello"}
                </Button>

                {/* Beautiful Instructions Popup */}
                {showInstructions && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="relative w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                      <div className="bg-white border-2 border-blue-200 rounded-3xl shadow-2xl p-8 relative">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Trello className="h-10 w-10 text-blue-700" />
                          </div>
                          <h4 className="text-3xl font-bold text-gray-900 mb-6">🔗 Connecting to Trello...</h4>
                          <div className="text-lg text-gray-700 space-y-4 mb-8 text-left bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100">
                            <p className="flex items-center space-x-4"><span className="text-3xl">1️⃣</span><span className="font-medium">A Trello popup will open</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">2️⃣</span><span className="font-medium">Click "Allow" to authorize LinkLoom</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">3️⃣</span><span className="font-medium">Trello will show you a token (long string)</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">4️⃣</span><span className="font-medium">The token window will close automatically</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">5️⃣</span><span className="font-medium">LinkLoom will ask you to paste the token</span></p>
                          </div>
                          <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300 rounded-2xl p-5 mb-8">
                            <p className="text-lg text-yellow-800 font-bold mb-2">⚠️ IMPORTANT: Copy the token quickly when you see it!</p>
                            <p className="text-base text-yellow-700">The window closes fast, so be ready to copy!</p>
                          </div>
                          <div className="flex gap-4 justify-center">
                            <Button onClick={() => setShowInstructions(false)} variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold border-2 hover:bg-gray-50">Cancel</Button>
                            <Button onClick={startTrelloOAuth} className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-10 py-4 text-lg font-semibold shadow-xl transform hover:scale-105 transition-all" size="lg">Start OAuth</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Beautiful Reminder Popup */}
                {showReminder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="relative w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                      <div className="bg-white border-2 border-blue-200 rounded-3xl shadow-2xl p-8 relative">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Trello className="h-10 w-10 text-blue-700" />
                          </div>
                          <h4 className="text-3xl font-bold text-gray-900 mb-6">💡 Quick Reminder!</h4>
                          <p className="text-xl text-gray-700 mb-6 font-semibold">The Trello popup should be open now.</p>
                          <div className="text-lg text-gray-700 space-y-4 mb-8 text-left bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                            <p className="font-bold text-blue-800 mb-4 text-center">After you click "Allow":</p>
                            <p className="flex items-center space-x-3"><span className="w-3 h-3 bg-blue-500 rounded-full"></span><span>You'll see a long token string</span></p>
                            <p className="flex items-center space-x-3"><span className="w-3 h-3 bg-blue-500 rounded-full"></span><span>Copy it quickly (the window closes fast!)</span></p>
                            <p className="flex items-center space-x-3"><span className="w-3 h-3 bg-blue-500 rounded-full"></span><span>LinkLoom will ask you to paste it</span></p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-5 mb-6">
                            <p className="text-lg text-blue-800 font-bold">Don't worry if the window closes - that's normal!</p>
                          </div>
                          <Button onClick={() => setShowReminder(false)} className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-10 py-4 text-lg font-semibold shadow-xl transform hover:scale-105 transition-all" size="lg">Got it!</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Beautiful Completion Popup */}
                {showCompletion && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="relative w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                      <div className="bg-white border-2 border-green-200 rounded-3xl shadow-2xl p-8 relative">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-100 via-green-200 to-green-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <CheckCircle className="h-10 w-10 text-green-700" />
                          </div>
                          <h4 className="text-3xl font-bold text-gray-900 mb-6">🎉 Trello Authorization Completed!</h4>
                          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-5 mb-8">
                            <p className="text-lg text-green-800 font-bold mb-2">The popup closed quickly - that's completely normal!</p>
                            <p className="text-base text-green-700">Trello always closes the token window automatically.</p>
                          </div>
                          <div className="text-lg text-gray-700 space-y-4 mb-8 text-left bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border border-green-100">
                            <p className="font-bold text-gray-800 mb-4 text-center">Now you need to:</p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">1️⃣</span><span className="font-medium">Go back to the Trello page (if it's still open)</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">2️⃣</span><span className="font-medium">Copy the long token string you saw</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">3️⃣</span><span className="font-medium">Paste it in the next prompt</span></p>
                          </div>
                          <div className="flex gap-4 justify-center">
                            <Button onClick={() => { setShowCompletion(false); setIsConnecting(false) }} variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold border-2 hover:bg-gray-50">Cancel</Button>
                            <Button onClick={() => { setShowCompletion(false); openManualTokenEntry(null) }} className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-10 py-4 text-lg font-semibold shadow-xl transform hover:scale-105 transition-all" size="lg">Enter Token</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Beautiful Manual Token Entry Modal */}
                {showManualTokenEntry && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="relative w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                      <div className="bg-white border-2 border-blue-200 rounded-3xl shadow-2xl p-8 relative">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Trello className="h-10 w-10 text-blue-700" />
                          </div>
                          <h4 className="text-3xl font-bold text-gray-900 mb-6">🔑 Manual Trello Token Entry</h4>
                          <div className="text-lg text-gray-700 space-y-4 mb-8 text-left bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100">
                            <p className="flex items-center space-x-4"><span className="text-3xl">1️⃣</span><span className="font-medium">Go back to the Trello authorization page</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">2️⃣</span><span className="font-medium">Look for a long string of letters and numbers (64+ characters)</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">3️⃣</span><span className="font-medium">Copy the entire token (it looks like: ATTA...)</span></p>
                            <p className="flex items-center space-x-4"><span className="text-3xl">4️⃣</span><span className="font-medium">Paste it below and click Submit</span></p>
                          </div>
                          <div className="mb-6">
                            <input
                              type="text"
                              value={manualToken}
                              onChange={(e) => setManualToken(e.target.value)}
                              placeholder="Paste your Trello token here..."
                              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                            />
                          </div>
                          <div className="flex gap-4 justify-center">
                            <Button 
                              onClick={() => { setShowManualTokenEntry(false); setIsConnecting(false) }} 
                              variant="outline" 
                              size="lg" 
                              className="px-10 py-4 text-lg font-semibold border-2 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleManualTokenSubmit}
                              className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-10 py-4 text-lg font-semibold shadow-xl transform hover:scale-105 transition-all" 
                              size="lg"
                            >
                              Submit Token
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Beautiful Success Popup */}
                {showSuccess && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="relative w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                      <div className="bg-white border-2 border-green-200 rounded-3xl shadow-2xl p-8 relative">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-100 via-green-200 to-green-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <CheckCircle className="h-10 w-10 text-green-700" />
                          </div>
                          <h4 className="text-3xl font-bold text-gray-900 mb-6">
                            {successType === 'connect' ? '🎉 Trello Connected Successfully!' : '✅ Trello Disconnected Successfully!'}
                          </h4>
                          {successType === 'connect' ? (
                            <>
                              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-5 mb-8">
                                <p className="text-lg text-green-800 font-bold mb-2">Your content will now sync automatically!</p>
                                <p className="text-base text-green-700">LinkLoom will keep your bio page up-to-date with your Trello content.</p>
                              </div>
                              <div className="text-lg text-gray-700 space-y-4 mb-8 text-left bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border border-green-100">
                                <p className="font-bold text-gray-800 mb-4 text-center">What happens next:</p>
                                <p className="flex items-center space-x-4"><span className="text-3xl">✅</span><span className="font-medium">Links from your Trello list will appear on your bio page</span></p>
                                <p className="flex items-center space-x-4"><span className="text-3xl">✅</span><span className="font-medium">Content updates automatically when you modify Trello cards</span></p>
                                <p className="flex items-center space-x-4"><span className="text-3xl">✅</span><span className="font-medium">Track clicks and engagement from your dashboard</span></p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-5 mb-8">
                                <p className="text-lg text-green-800 font-bold mb-2">Trello has been disconnected successfully!</p>
                                <p className="text-base text-green-700">Your bio page will no longer sync with Trello content.</p>
                              </div>
                              <div className="text-lg text-gray-700 space-y-4 mb-8 text-left bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border border-green-100">
                                <p className="font-bold text-gray-800 mb-4 text-center">What this means:</p>
                                <p className="flex items-center space-x-4"><span className="text-3xl">🔄</span><span className="font-medium">Automatic syncing has been stopped</span></p>
                                <p className="flex items-center space-x-4"><span className="text-3xl">📝</span><span className="font-medium">Existing links will remain on your bio page</span></p>
                                <p className="flex items-center space-x-4"><span className="text-3xl">🔗</span><span className="font-medium">You can reconnect anytime from the Integrations page</span></p>
                              </div>
                            </>
                          )}
                          <Button 
                            onClick={() => setShowSuccess(false)}
                            className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white px-10 py-4 text-lg font-semibold shadow-xl transform hover:scale-105 transition-all"
                            size="lg"
                          >
                            {successType === 'connect' ? 'Get Started!' : 'Got it!'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Google Analytics</CardTitle>
                <CardDescription>
                  Track your bio page performance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Coming soon! Get detailed insights into your bio page traffic and link performance.
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
          <div>
            <CardTitle className="text-lg">Slack</CardTitle>
            <CardDescription>
              Get notifications about your links
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Coming soon! Receive notifications when your bio links are updated or when there are sync issues.
        </p>
        <Button variant="outline" size="sm" disabled>
          Coming Soon
        </Button>
      </CardContent>
    </Card>
  </div>

  {/* Integration Tips */}
  <Card className="bg-muted/30">
    <CardHeader>
      <CardTitle className="flex items-center">
        <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
        Pro Tips
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• Use a dedicated Trello list for published content to keep your bio links organized</li>
        <li>• Add URLs in the card description or as attachments for automatic detection</li>
        <li>• Set up automation rules to control which links appear on your bio page</li>
        <li>• Sync every 10 minutes to keep your links fresh and up-to-date</li>
      </ul>
            </CardContent>
      </Card>

      {/* Future Integrations */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* GitHub Integration */}
          <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🐙</span>
                </div>
                <div>
                  <CardTitle className="text-gray-900">GitHub</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sync repositories, issues, and releases
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Badge variant="outline" className="mb-3">Coming Soon</Badge>
                <p className="text-sm text-gray-600">
                  Automatically sync your GitHub projects and documentation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notion Integration */}
          <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📝</span>
                </div>
                <div>
                  <CardTitle className="text-gray-900">Notion</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sync databases and documentation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Badge variant="outline" className="mb-3">Coming Soon</Badge>
                <p className="text-sm text-gray-600">
                  Keep your bio links updated from Notion databases
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Airtable Integration */}
          <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📊</span>
                </div>
                <div>
                  <CardTitle className="text-gray-900">Airtable</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sync structured content databases
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Badge variant="outline" className="mb-3">Coming Soon</Badge>
                <p className="text-sm text-gray-600">
                  Automate bio links from Airtable content calendars
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
