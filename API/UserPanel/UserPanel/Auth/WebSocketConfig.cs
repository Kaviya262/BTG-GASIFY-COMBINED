
using System.Net.WebSockets;
using System.Text;

namespace UserPanel.Auth
{
    public class WebSocketConfig
    {

        public async Task HandleWebSocketConnection(WebSocket webSocket)
        {
            try
            {
                var buffer = new byte[1024 * 4];

                // Continuously receive data from the WebSocket
                if (webSocket.State == WebSocketState.Open)
                {
                    while (webSocket.State == WebSocketState.Open)
                    {
                        CancellationTokenSource cts = new CancellationTokenSource();

                        var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cts.Token);

                        if (result.MessageType == WebSocketMessageType.Text)
                        {
                            // Convert byte buffer to a string (barcode data)
                            var barcode = Encoding.UTF8.GetString(buffer, 0, result.Count);
                            Console.WriteLine($"Received barcode: {barcode}");

                            // Send a response back to the client (React app)
                            var response = Encoding.UTF8.GetBytes($"Barcode received: {barcode}");
                            await webSocket.SendAsync(new ArraySegment<byte>(response), WebSocketMessageType.Text, true, CancellationToken.None);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }
    }
}
